import requests
import make_game
games_list = open("test_codes.txt", "r", encoding="utf-8-sig")
database = r"/Users/kiwi/Desktop/database?/bored.db"


def parse_game(tree):
    all_name_elements = tree.find('.//name')
    print(all_name_elements)
    if all_name_elements is None:
        print(response._content)
        return None
    game_name = (etree.tostring(all_name_elements, pretty_print=True).decode().strip()).replace('<name type="primary" sortindex="1" value="', '').replace('"/>', "")

    all_minplayers_elements = tree.find('.//minplayers')
    min_players = (etree.tostring(all_minplayers_elements, pretty_print = True).decode().strip()).replace('<minplayers value="', "").replace('"/>', "")

    all_maxplayers_elements = tree.find('.//maxplayers')
    max_players = (etree.tostring(all_maxplayers_elements, pretty_print = True).decode().strip()).replace('<maxplayers value="', "").replace('"/>', "")

    all_minplaytime_elements = tree.find('.//minplaytime')
    min_play_time = (etree.tostring(all_minplaytime_elements, pretty_print = True).decode().strip()).replace('<minplaytime value="', "").replace('"/>', "")

    all_maxplaytime_elements = tree.find('.//maxplaytime')
    max_play_time = (etree.tostring(all_maxplaytime_elements, pretty_print = True).decode().strip()).replace('<maxplaytime value="', "").replace('"/>', "")

    game_info = "(" + game_id + ", " + game_name + ", " + min_players + ", " + max_players + ", " + min_play_time + ", " + max_play_time + ")"
    print(game_info)

    count = tree.xpath('count(.//link[@type="boardgamecategory"])')
    print(count)

    if count == 0:
        type_game = "No game type."
    else:
        all_type_elements = tree.findall('.//link[@type="boardgamecategory"]')[0]
        type_game = (etree.tostring(all_type_elements, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")
    proc = 1.0
    while proc < count:
        all_type_elements_2 = tree.findall('.//link[@type="boardgamecategory"]')[int(proc)]
        type_game_tmp = (etree.tostring(all_type_elements_2, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")
        type_game += ", " + type_game_tmp
        proc += 1.0
    game_type = "'" + type_game + "'"
    print(game_type)

    game = (game_id, game_name, game_type, min_players, max_players, min_play_time, max_play_time)
    return game

if make_game.exists_game(database, game_id):
        #make_game.remove_game(database, game_id)
        #print("Game removed!")
        print("Game already found")
else:
        print("Adding game...")

response = requests.get(f'https://www.boardgamegeek.com/xmlapi2/thing?type=boardgame&id={game_id}')
from lxml import etree
tree = etree.fromstring(response._content)
game = parse_game(tree)

make_game.create_game(database, game)
print("Game added!")