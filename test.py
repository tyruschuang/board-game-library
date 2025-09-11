import requests
import make_game
database = r"/Users/kiwi/Desktop/database?/bored.db"
file = open("test_codes.txt", "r")
for line in file:
    print(line)
    game_id = line
    print(game_id)
    response = requests.get(f'https://www.boardgamegeek.com/xmlapi2/thing?type=boardgame&id={game_id}')
    from lxml import etree
    tree = etree.fromstring(response._content)

    all_name_elements = tree.find('.//name')
    game_name = (etree.tostring(all_name_elements, pretty_print=True).decode().strip()).replace('<name type="primary" sortindex="1" value=', '').replace("/>", "")

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

    if 1.0 == count:
        all_type_elements = tree.findall('.//link[@type="boardgamecategory"]')[0]
        type_game = (etree.tostring(all_type_elements, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        game_type = "'" + type_game + "'"
        print(game_type)

        with open("make_game.py") as file:
            exec(file.read())
            print("Game added!")

    if 2.0 == count:
        all_type_elements = tree.findall('.//link[@type="boardgamecategory"]')[0]
        type_game = (etree.tostring(all_type_elements, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        all_type_elements_2 = tree.findall('.//link[@type="boardgamecategory"]')[1]
        type_game_2 = (etree.tostring(all_type_elements_2, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        game_type = "'" + type_game + ",  " + type_game_2 + "'"
        print(game_type)

        with open("make_game.py") as file:
            exec(file.read())
            print("Game added!")

    if 3.0 <= count:
        all_type_elements = tree.findall('.//link[@type="boardgamecategory"]')[0]
        type_game = (etree.tostring(all_type_elements, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        all_type_elements_2 = tree.findall('.//link[@type="boardgamecategory"]')[1]
        type_game_2 = (etree.tostring(all_type_elements_2, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        all_type_elements_3 = tree.findall('.//link[@type="boardgamecategory"]')[2]
        type_game_3 = (etree.tostring(all_type_elements_3, pretty_print=True).decode().strip()).replace('<link type="boardgamecategory" ', "").replace('"/>', "").replace('value="', "")

        game_type = "'" + type_game + ",  " + type_game_2 + ",  " + type_game_3 + "'"
        print(game_type)

        with open("make_game.py") as file:
            exec(file.read())
            print("Game added!")