import requests
games_list = open("Games.txt", "r")
count = 0

while True:
    count +=1
    game = games_list.readline().strip()
    print(game)

    new_game = game.replace(" ", "%20").replace("&","%26")
    print(new_game)

    if not game:
        break

    params = {
        'search': "'" + new_game + "'",
    }

    response = requests.get(f'https://boardgamegeek.com/xmlapi/search?search={new_game}')
    from lxml import etree
    root = etree.fromstring(response._content)
    print(etree.tostring(root, pretty_print=True).decode())

games_list.close