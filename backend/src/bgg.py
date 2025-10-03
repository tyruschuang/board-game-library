import math
import time
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import gzip
import zlib
from typing import Dict, List, Optional, Any, Tuple, Iterable, Set
import os
import sqlite3
import json
import html
import re

from flask import Blueprint, jsonify, request


bp = Blueprint("bgg", __name__, url_prefix="/api/bgg")


BGG_BASE = "https://boardgamegeek.com/xmlapi2"

# Client-side rate limiting for BGG calls
_LAST_HTTP_TS: float = 0.0
_MIN_HTTP_INTERVAL_SEC: float = 0.35  # ~3 req/sec

# Simple in-memory TTL caches
try:
    from collections import OrderedDict
except Exception:  # pragma: no cover
    OrderedDict = dict  # type: ignore


class TTLCache:
    def __init__(self, capacity: int, default_ttl: float):
        self.capacity = capacity
        self.default_ttl = default_ttl
        self.data: "OrderedDict[Any, Tuple[float, Any]]" = OrderedDict()

    def _purge(self):
        now = time.time()
        # Drop expired entries
        expired = [k for k, (exp, _) in self.data.items() if exp < now]
        for k in expired:
            self.data.pop(k, None)
        # Enforce capacity (LRU)
        while len(self.data) > self.capacity:
            self.data.popitem(last=False)

    def get(self, key: Any) -> Any:
        self._purge()
        item = self.data.get(key)
        if not item:
            return None
        exp, val = item
        if exp < time.time():
            self.data.pop(key, None)
            return None
        # Mark as recently used
        self.data.move_to_end(key, last=True)
        return val

    def set(self, key: Any, val: Any, ttl: Optional[float] = None):
        exp = time.time() + (ttl if ttl is not None else self.default_ttl)
        self.data[key] = (exp, val)
        self.data.move_to_end(key, last=True)
        self._purge()


_SEARCH_CACHE = TTLCache(capacity=256, default_ttl=10 * 60)  # 10 minutes
_THING_CACHE = TTLCache(capacity=4096, default_ttl=24 * 60 * 60)  # 24 hours
_HOT_IDS_CACHE = TTLCache(capacity=16, default_ttl=5 * 60)  # 5 minutes
_HOT_MIN_EXPECTED = 40  # refresh hot list if we cached fewer than this

# -------------------- Persistent (SQLite) cache --------------------

CACHE_DB_PATH = os.path.join(os.path.dirname(__file__), "cache.db")

def _pc_conn():
    conn = sqlite3.connect(CACHE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _pc_init():
    conn = _pc_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bgg_cache_search (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bgg_cache_thing (
                id INTEGER PRIMARY KEY,
                data TEXT NOT NULL,
                has_stats INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS bgg_cache_hot (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
            """
        )
        now = int(time.time())
        conn.execute("DELETE FROM bgg_cache_search WHERE expires_at < ?", (now,))
        conn.execute("DELETE FROM bgg_cache_thing WHERE expires_at < ?", (now,))
        conn.execute("DELETE FROM bgg_cache_hot WHERE expires_at < ?", (now,))
        conn.commit()
    finally:
        conn.close()


def _pc_get_search(key: str) -> Optional[List[int]]:
    _pc_init()
    conn = _pc_conn()
    try:
        cur = conn.execute("SELECT value, expires_at FROM bgg_cache_search WHERE key = ?", (key,))
        row = cur.fetchone()
        if not row:
            return None
        if int(row["expires_at"]) < int(time.time()):
            conn.execute("DELETE FROM bgg_cache_search WHERE key = ?", (key,))
            conn.commit()
            return None
        try:
            return json.loads(row["value"]) or []
        except Exception:
            return None
    finally:
        conn.close()


def _pc_set_search(key: str, ids: List[int], ttl: int = 600):
    _pc_init()
    conn = _pc_conn()
    try:
        expires = int(time.time()) + ttl
        conn.execute(
            "REPLACE INTO bgg_cache_search (key, value, expires_at) VALUES (?, ?, ?)",
            (key, json.dumps(ids), expires),
        )
        conn.commit()
    finally:
        conn.close()


def _pc_get_thing(gid: int, need_stats: bool = False) -> Optional[Dict[str, Any]]:
    _pc_init()
    conn = _pc_conn()
    try:
        cur = conn.execute(
            "SELECT data, has_stats, expires_at FROM bgg_cache_thing WHERE id = ?",
            (gid,),
        )
        row = cur.fetchone()
        if not row:
            return None
        if int(row["expires_at"]) < int(time.time()):
            conn.execute("DELETE FROM bgg_cache_thing WHERE id = ?", (gid,))
            conn.commit()
            return None
        try:
            raw = json.loads(row["data"]) or None
        except Exception:
            raw = None
        if not raw:
            return None

        data = _normalize_game_payload(raw)
        if not data:
            conn.execute("DELETE FROM bgg_cache_thing WHERE id = ?", (gid,))
            conn.commit()
            return None

        if data != raw:
            try:
                stats_block = data.get("stats") or {}
                has_stats_val = 1 if (data.get("rating") is not None or any(stats_block.get(key) is not None for key in ("usersRated", "bayesAverage", "rank"))) else 0
                conn.execute(
                    "REPLACE INTO bgg_cache_thing (id, data, has_stats, expires_at) VALUES (?, ?, ?, ?)",
                    (gid, json.dumps(data), has_stats_val, int(row["expires_at"])),
                )
                conn.commit()
            except Exception:
                pass

        has_stats_flag = int(row["has_stats"] or 0)
        if need_stats and not has_stats_flag:
            stats_block = data.get("stats") or {}
            if not any(stats_block.get(key) is not None for key in ("usersRated", "bayesAverage", "rank")) and data.get("rating") is None:
                return None

        return data
    finally:
        conn.close()


def _pc_set_thing(gid: int, data: Dict[str, Any], ttl: int = 24 * 60 * 60):
    normalized = _normalize_game_payload(data)
    if not normalized:
        return

    _pc_init()
    conn = _pc_conn()
    try:
        expires = int(time.time()) + ttl
        stats_block = normalized.get("stats") or {}
        has_stats = 1 if (normalized.get("rating") is not None or any(stats_block.get(key) is not None for key in ("usersRated", "bayesAverage", "rank"))) else 0
        conn.execute(
            "REPLACE INTO bgg_cache_thing (id, data, has_stats, expires_at) VALUES (?, ?, ?, ?)",
            (gid, json.dumps(normalized), has_stats, expires),
        )
        conn.commit()
    finally:
        conn.close()


def _pc_get_hot(key: str) -> Optional[List[int]]:
    _pc_init()
    conn = _pc_conn()
    try:
        cur = conn.execute("SELECT value, expires_at FROM bgg_cache_hot WHERE key = ?", (key,))
        row = cur.fetchone()
        if not row:
            return None
        if int(row["expires_at"]) < int(time.time()):
            conn.execute("DELETE FROM bgg_cache_hot WHERE key = ?", (key,))
            conn.commit()
            return None
        try:
            return json.loads(row["value"]) or []
        except Exception:
            return None
    finally:
        conn.close()


def _pc_set_hot(key: str, ids: List[int], ttl: int = 5 * 60):
    _pc_init()
    conn = _pc_conn()
    try:
        expires = int(time.time()) + ttl
        conn.execute(
            "REPLACE INTO bgg_cache_hot (key, value, expires_at) VALUES (?, ?, ?)",
            (key, json.dumps(ids), expires),
        )
        conn.commit()
    finally:
        conn.close()


def _http_get(url: str, timeout: int = 20) -> bytes:
    # Simple client-side rate limiting
    global _LAST_HTTP_TS
    delta = time.time() - _LAST_HTTP_TS
    if delta < _MIN_HTTP_INTERVAL_SEC:
        time.sleep(_MIN_HTTP_INTERVAL_SEC - delta)
    headers = {
        # Use a browser-like UA to avoid any overly strict filters/CDN heuristics
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0 Safari/537.36 BoardGameLibrary/1.0"
        ),
        "Accept": "application/xml, text/xml;q=0.9, */*;q=0.8",
        "Connection": "keep-alive",
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        data = resp.read()
        _LAST_HTTP_TS = time.time()
        return data


def _maybe_decompress(data: bytes) -> bytes:
    # GZIP magic header: 1F 8B
    if data.startswith(b"\x1f\x8b"):
        try:
            out = gzip.decompress(data)
            return out
        except OSError as e:
            print("Gzip decompression failed:", str(e))

    # Some servers send zlib or raw deflate; wbits=47 auto-detects gzip/zlib
    try:
        out = zlib.decompress(data, wbits=47)
        return out
    except zlib.error:
        # Not compressed (or not a supported format) — use as-is
        return data

def _get_xml(url: str, tries: int = 5, backoff: float = 1.2) -> Optional[ET.Element]:
    last_err: Optional[Exception] = None
    for attempt in range(tries):
        try:
            data = _http_get(url)

            data = _maybe_decompress(data)

            # Quick detection for queue/processing messages (on decompressed data)
            if b"<message" in data and (b"queue" in data.lower() or b"process" in data.lower()):
                print("BGG indicates queued response, retrying...")
                raise RuntimeError("BGG queued response")

            root = ET.fromstring(data)

            # Some queued responses parse as <message>...
            if root.tag.lower() == "message":
                raise RuntimeError("BGG queued response")

            return root

        except (urllib.error.URLError, urllib.error.HTTPError, ET.ParseError, RuntimeError) as e:
            last_err = e
            if attempt < tries - 1:
                time.sleep(backoff * (attempt + 1))
                continue
    return None


def _slugify(s: str) -> str:
    out = []
    last_dash = False
    for ch in s.lower():
        if ch.isalnum():
            out.append(ch)
            last_dash = False
        else:
            if not last_dash:
                out.append("-")
                last_dash = True
    slug = "".join(out).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug


def _weight_bucket(avg_weight: Optional[float]) -> str:
    if avg_weight is None:
        return "medium"
    # Common thresholds used informally in the community
    if avg_weight < 2.25:
        return "light"
    if avg_weight < 3.5:
        return "medium"
    return "heavy"





def _sanitize_text(s: str) -> str:
    if not isinstance(s, str):
        return ""
    try:
        s2 = html.unescape(s)
    except Exception:
        s2 = s
    s2 = s2.replace('\r\n', '\n').replace('\r', '\n').replace('\xa0', ' ')
    s2 = re.sub(r'[\t ]+', ' ', s2)
    s2 = re.sub(r'\n{3,}', '\n\n', s2)
    return s2.strip()


def _sanitize_game_obj(g: dict) -> dict:
    try:
        d = g.get('description')
        if isinstance(d, str) and ('&' in d or '&#' in d or '\xa0' in d):
            sd = _sanitize_text(d)
            if sd != d:
                g['description'] = sd
    except Exception:
        pass
    return g


def _coerce_int(val: Optional[str]) -> Optional[int]:
    if val is None:
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        try:
            return int(float(val))
        except (TypeError, ValueError):
            return None


def _coerce_float(val: Optional[str]) -> Optional[float]:
    if val is None:
        return None
    try:
        result = float(val)
    except (TypeError, ValueError):
        return None
    if math.isnan(result) or math.isinf(result):
        return None
    return result


def _chunked(seq: Iterable[int], size: int) -> Iterable[List[int]]:
    seq_list = list(seq)
    for i in range(0, len(seq_list), size):
        yield seq_list[i : i + size]


def _dedupe_preserve(items: Iterable[Any]) -> List[Any]:
    seen: Set[Any] = set()
    out: List[Any] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        out.append(item)
    return out


def _normalize_game_payload(raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not isinstance(raw, dict):
        return None

    game = dict(raw)
    gid = game.get("id") or game.get("gid") or game.get("game_id")
    if gid is None:
        return None
    gid_str = str(gid)

    name = game.get("name") or game.get("title") or f"BGG Item {gid_str}"
    name = str(name)

    image = game.get("image") or game.get("thumbnail") or ""
    image = str(image)

    year = _coerce_int(game.get("year") or game.get("yearpublished"))
    rating = _coerce_float(game.get("rating") or game.get("avg_rating") or game.get("average"))

    players_data = game.get("players") if isinstance(game.get("players"), dict) else {}
    if not isinstance(players_data, dict):
        players_data = {}
    min_players = _coerce_int(players_data.get("min")) if players_data else None
    max_players = _coerce_int(players_data.get("max")) if players_data else None
    if min_players is None:
        min_players = _coerce_int(game.get("min_players") or game.get("minplayers"))
    if max_players is None:
        max_players = _coerce_int(game.get("max_players") or game.get("maxplayers"))
    if min_players is None and max_players is not None:
        min_players = max_players
    if max_players is None and min_players is not None:
        max_players = min_players
    if min_players is None:
        min_players = 0
    if max_players is None:
        max_players = min_players
    players = {"min": min_players, "max": max_players}

    time_data = game.get("time") if isinstance(game.get("time"), dict) else {}
    if not isinstance(time_data, dict):
        time_data = {}
    min_time = _coerce_int(time_data.get("min")) if time_data else None
    max_time = _coerce_int(time_data.get("max")) if time_data else None
    if min_time is None:
        min_time = _coerce_int(game.get("min_time") or game.get("minplaytime"))
    if max_time is None:
        max_time = _coerce_int(game.get("max_time") or game.get("maxplaytime"))
    if min_time is None and max_time is not None:
        min_time = max_time
    if max_time is None and min_time is not None:
        max_time = min_time
    if min_time is None:
        min_time = 0
    if max_time is None:
        max_time = min_time
    time_block = {"min": min_time, "max": max_time}

    tags_raw = game.get("tags")
    if isinstance(tags_raw, (list, tuple, set)):
        tags_iter = tags_raw
    elif tags_raw:
        tags_iter = [tags_raw]
    else:
        tags_iter = []
    tags: List[str] = []
    for item in tags_iter:
        try:
            text = str(item).strip()
        except Exception:
            continue
        if not text:
            continue
        slug = _slugify(text) or text.strip().lower()
        if not slug:
            continue
        tags.append(slug)
    tags = _dedupe_preserve(tags)

    stats_raw = game.get("stats") if isinstance(game.get("stats"), dict) else {}
    if not isinstance(stats_raw, dict):
        stats_raw = {}
    users_rated = _coerce_int(stats_raw.get("usersRated") or stats_raw.get("users_rated") or stats_raw.get("usersrated"))
    bayes_avg = _coerce_float(stats_raw.get("bayesAverage") or stats_raw.get("bayes_average") or stats_raw.get("bayesaverage"))
    rank_val = _coerce_int(stats_raw.get("rank"))
    avg_weight = _coerce_float(
        stats_raw.get("averageWeight")
        or stats_raw.get("avgWeight")
        or stats_raw.get("average_weight")
        or stats_raw.get("averageweight")
    )
    stats: Dict[str, Any] = {
        "usersRated": users_rated,
        "bayesAverage": bayes_avg,
        "rank": rank_val,
    }
    if avg_weight is not None:
        stats["averageWeight"] = avg_weight

    weight = str(game.get("weight") or "").strip().lower()
    if weight not in {"light", "medium", "heavy"}:
        weight = _weight_bucket(avg_weight) if avg_weight is not None else "medium"

    description = str(game.get("description") or "")
    url = game.get("url") or f"https://boardgamegeek.com/boardgame/{gid_str}/{_slugify(name)}"
    url = str(url)

    normalized = {
        "id": gid_str,
        "name": name,
        "image": image,
        "year": year,
        "rating": rating,
        "players": players,
        "time": time_block,
        "weight": weight,
        "tags": tags,
        "description": description,
        "stats": stats,
        "url": url,
    }

    return _sanitize_game_obj(normalized)


def _parse_thing_item(item: ET.Element) -> Optional[Dict[str, Any]]:
    gid_attr = item.get("id") or item.get("objectid")
    if not gid_attr:
        return None
    try:
        gid = int(gid_attr)
    except (TypeError, ValueError):
        return None

    name_val = None
    for name_el in item.findall("name"):
        if name_el.get("type") == "primary" and name_el.get("value"):
            name_val = name_el.get("value")
            break
    if not name_val:
        fallback = item.find("name")
        if fallback is not None:
            name_val = fallback.get("value")
    if not name_val:
        name_val = f"BGG Item {gid}"

    year_el = item.find("yearpublished")
    year = _coerce_int(year_el.get("value") if year_el is not None else None)
    min_players_el = item.find("minplayers")
    min_players = _coerce_int(min_players_el.get("value") if min_players_el is not None else None)
    max_players_el = item.find("maxplayers")
    max_players = _coerce_int(max_players_el.get("value") if max_players_el is not None else None)
    min_time_el = item.find("minplaytime")
    min_time = _coerce_int(min_time_el.get("value") if min_time_el is not None else None)
    max_time_el = item.find("maxplaytime")
    max_time = _coerce_int(max_time_el.get("value") if max_time_el is not None else None)

    ratings = item.find("statistics/ratings")
    avg_rating = _coerce_float(ratings.find("average").get("value")) if ratings is not None and ratings.find("average") is not None else None
    bayes_avg = _coerce_float(ratings.find("bayesaverage").get("value")) if ratings is not None and ratings.find("bayesaverage") is not None else None
    users_rated = _coerce_int(ratings.find("usersrated").get("value")) if ratings is not None and ratings.find("usersrated") is not None else None
    avg_weight = _coerce_float(ratings.find("averageweight").get("value")) if ratings is not None and ratings.find("averageweight") is not None else None

    rank_val: Optional[int] = None
    if ratings is not None:
        for rank_el in ratings.findall("ranks/rank"):
            if (rank_el.get("name") or "").lower() == "boardgame":
                rank_attr = rank_el.get("value")
                if rank_attr and rank_attr.isdigit():
                    rank_val = int(rank_attr)
                break

    tag_types = {
        "boardgamecategory",
        "boardgamemechanic",
        "boardgamefamily",
        "boardgamesubdomain",
    }
    tags: List[str] = []
    for link_el in item.findall("link"):
        if (link_el.get("type") or "").lower() not in tag_types:
            continue
        raw = link_el.get("value")
        if not raw:
            continue
        slug = _slugify(raw)
        if not slug:
            continue
        tags.append(slug)
    tags = _dedupe_preserve(tags)

    desc = item.findtext("description") or ""

    game: Dict[str, Any] = {
        "id": str(gid),
        "name": name_val,
        "image": item.findtext("image") or item.findtext("thumbnail") or "",
        "year": year,
        "rating": avg_rating,
        "players": {
            "min": min_players or 0,
            "max": max_players or (min_players or 0),
        },
        "time": {
            "min": min_time or 0,
            "max": max_time or (min_time or 0),
        },
        "weight": _weight_bucket(avg_weight),
        "tags": tags,
        "description": desc,
        "stats": {
            "usersRated": users_rated,
            "bayesAverage": bayes_avg,
            "rank": rank_val,
        },
        "url": f"https://boardgamegeek.com/boardgame/{gid}/{_slugify(name_val)}",
    }
    if avg_weight is not None:
        game["stats"]["averageWeight"] = avg_weight

    return _sanitize_game_obj(game)


def _hydrate_games(ids: List[int]) -> List[Dict[str, Any]]:
    if not ids:
        return []

    results: Dict[int, Dict[str, Any]] = {}
    missing: List[int] = []

    for gid in ids:
        cached = _THING_CACHE.get(gid)
        if cached:
            normalized = _normalize_game_payload(cached)
            if normalized:
                results[gid] = normalized
                if normalized is not cached:
                    _THING_CACHE.set(gid, normalized)
                continue
        cached_db = _pc_get_thing(gid, need_stats=True)
        if cached_db:
            _THING_CACHE.set(gid, cached_db)
            results[gid] = cached_db
            continue
        missing.append(gid)

    for chunk in _chunked(missing, 40):
        if not chunk:
            continue
        url = f"{BGG_BASE}/thing?id={','.join(str(x) for x in chunk)}&stats=1"
        root = _get_xml(url)
        if root is None:
            continue
        for item in root.findall("item"):
            parsed = _parse_thing_item(item)
            if not parsed:
                continue
            gid_int = int(parsed["id"])
            _pc_set_thing(gid_int, parsed)
            _THING_CACHE.set(gid_int, parsed)
            results[gid_int] = parsed

    return [results[gid] for gid in ids if gid in results]


def _fetch_hot_ids(kind: str) -> List[int]:
    root = _get_xml(f"{BGG_BASE}/hot?type={urllib.parse.quote(kind)}")
    if root is None:
        return []

    parsed_ids: List[int] = []
    for item in root.findall("item"):
        gid_attr = item.get("id") or item.get("objectid")
        if not gid_attr:
            continue
        try:
            parsed_ids.append(int(gid_attr))
        except (TypeError, ValueError):
            continue

    return _dedupe_preserve(parsed_ids)


def _get_hot_ids(kind: str = "boardgame") -> List[int]:
    cache_key = f"hot:{kind}"
    ids = _HOT_IDS_CACHE.get(cache_key)
    if ids and len(ids) >= _HOT_MIN_EXPECTED:
        return ids

    stored = _pc_get_hot(cache_key)
    if stored and len(stored) >= _HOT_MIN_EXPECTED:
        _HOT_IDS_CACHE.set(cache_key, stored)
        return stored

    fresh = _fetch_hot_ids(kind)
    if fresh:
        _HOT_IDS_CACHE.set(cache_key, fresh)
        _pc_set_hot(cache_key, fresh)
        return fresh

    if ids:
        return ids
    if stored:
        return stored
    return fresh


def _get_search_ids(query: str) -> List[int]:
    norm = re.sub(r"\s+", " ", query.strip().lower())
    if not norm:
        return []

    cached = _SEARCH_CACHE.get(norm)
    if cached is not None:
        return cached

    stored = _pc_get_search(norm)
    if stored is not None:
        _SEARCH_CACHE.set(norm, stored)
        return stored

    params = {
        "query": query,
        "type": "boardgame,boardgameexpansion",
    }
    url = f"{BGG_BASE}/search?{urllib.parse.urlencode(params)}"
    root = _get_xml(url)
    if root is None:
        return []

    ids: List[int] = []
    for item in root.findall("item"):
        if (item.get("type") or "").lower() not in {"boardgame", "boardgameexpansion"}:
            continue
        gid_attr = item.get("id")
        if not gid_attr:
            continue
        try:
            ids.append(int(gid_attr))
        except (TypeError, ValueError):
            continue

    ids = _dedupe_preserve(ids)
    _SEARCH_CACHE.set(norm, ids)
    _pc_set_search(norm, ids)
    return ids


def _apply_filters(
    games: List[Dict[str, Any]],
    players: Optional[int],
    weight: Optional[str],
    min_time: Optional[int],
    max_time: Optional[int],
    tag_filters: Set[str],
) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for game in games:
        g_players = game.get("players") or {}
        g_time = game.get("time") or {}
        g_tags = set(game.get("tags") or [])

        if players is not None:
            g_min = int(g_players.get("min") or 0)
            g_max = int(g_players.get("max") or g_min)
            if players < g_min or players > g_max:
                continue

        if weight and weight != game.get("weight"):
            continue

        if min_time is not None or max_time is not None:
            g_min_t = int(g_time.get("min") or 0)
            g_max_t = int(g_time.get("max") or g_min_t)
            if min_time is not None and g_max_t < min_time:
                continue
            if max_time is not None and g_min_t > max_time:
                continue

        if tag_filters and not g_tags.intersection(tag_filters):
            continue

        out.append(game)

    return out


def _extract_request_filters(args) -> Dict[str, Any]:
    players = _coerce_int(args.get("players")) if args.get("players") not in (None, "") else None
    weight = (args.get("weight") or "").strip().lower()
    if weight not in {"light", "medium", "heavy"}:
        weight = None

    min_time = _coerce_int(args.get("min_time")) if args.get("min_time") else None
    max_time = _coerce_int(args.get("max_time")) if args.get("max_time") else None

    tags_param = args.get("tags") or ""
    tag_filters = {t.strip().lower() for t in tags_param.split(",") if t.strip()}

    return {
        "players": players,
        "weight": weight,
        "min_time": min_time,
        "max_time": max_time,
        "tags": tag_filters,
    }


def _paginate(games: List[Any], page: int, limit: int) -> List[Any]:
    if limit <= 0:
        return []
    start = (page - 1) * limit
    if start >= len(games):
        return []
    end = start + limit
    return games[start:end]


def _safe_int(arg_val: Any, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(arg_val)
    except (TypeError, ValueError):
        return default
    return max(minimum, min(maximum, value))


@bp.get("/hot")
def hot_games():
    limit = _safe_int(request.args.get("limit", 20), 20, 1, 50)
    page = _safe_int(request.args.get("page", 1), 1, 1, 100)

    filters = _extract_request_filters(request.args)

    ids = _get_hot_ids("boardgame")
    if not ids:
        return jsonify({"error": "Unable to load hot list from BGG"}), 502

    paginated = _paginate(ids, page, 20)
    games = _hydrate_games(paginated)
    filtered = _apply_filters(
        games,
        filters["players"],
        filters["weight"],
        filters["min_time"],
        filters["max_time"],
        filters["tags"],
    )

    total = len(ids)
    pages = math.ceil(total / limit) if total and limit else 0

    filters_payload = {
        "players": filters["players"],
        "weight": filters["weight"],
        "min_time": filters["min_time"],
        "max_time": filters["max_time"],
        "tags": sorted(filters["tags"]),
    }

    return jsonify(
        {
            "results": filtered,
            "total": total,
            "pages": pages,
            "page": page,
            "limit": limit,
            "filters": filters_payload,
            "source": "hot",
        }
    )


@bp.get("/search")
def search_games():
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"results": [], "total": 0, "pages": 0, "page": 1, "limit": 0, "query": ""})

    limit = _safe_int(request.args.get("limit", 20), 20, 1, 50)
    page = _safe_int(request.args.get("page", 1), 1, 1, 100)

    filters = _extract_request_filters(request.args)

    ids = _get_search_ids(query)
    if not ids:
        filters_payload = {
            "players": filters["players"],
            "weight": filters["weight"],
            "min_time": filters["min_time"],
            "max_time": filters["max_time"],
            "tags": sorted(filters["tags"]),
        }
        return jsonify(
            {
                "results": [],
                "total": 0,
                "pages": 0,
                "page": page,
                "limit": limit,
                "query": query,
                "filters": filters_payload,
            }
        )

    paginated = _paginate(ids, page, 20)
    games = _hydrate_games(paginated)
    filtered = _apply_filters(
        games,
        filters["players"],
        filters["weight"],
        filters["min_time"],
        filters["max_time"],
        filters["tags"],
    )

    total = len(ids)
    pages = math.ceil(total / limit) if total and limit else 0

    filters_payload = {
        "players": filters["players"],
        "weight": filters["weight"],
        "min_time": filters["min_time"],
        "max_time": filters["max_time"],
        "tags": sorted(filters["tags"]),
    }

    return jsonify(
        {
            "results": filtered,
            "total": total,
            "pages": pages,
            "page": page,
            "limit": limit,
            "query": query,
            "filters": filters_payload,
            "source": "search",
        }
    )
