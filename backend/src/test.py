from backend.src.bgg import _get_search_ids, _hydrate_games, _paginate

ids = _get_search_ids("Catan")
ids = _paginate(ids, 1, 20)
games = _hydrate_games(ids)
print(games)
