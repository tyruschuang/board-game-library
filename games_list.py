games_list = open("Games.txt", "r")
game = games_list.readline()
print(game)

new_game = game.replace(" ", "%20")
print(new_game)

print("'" + new_game + "'")