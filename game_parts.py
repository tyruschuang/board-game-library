name = input("What is the name of the game?\n")
import query_library
column_names = ["id", "name", "type", "min_players", "max_players", "min_play_time", "max_play_time"]
game_data_tuple = query_library.get_game_data_by_name(database, name, column_names)
dictionary = dict(zip(column_names, game_data_tuple))
#clean up reading of dictionary?
print("What would you like to be similar to " + name + "?")
for i in range(1, len(column_names)):
    print("\t" + str(i) + ". " + column_names[i])
similarity = input("\n")

def search(database):
    # make it so that it returns a statement if no rows are found
    if "2" == similarity:
        query_library.select_game_by_type(database)
    # right now exactly that many min_players, also lower?
    elif "3" == similarity:
        query_library.select_similar(database, name, "min_players")
    # exactly max, also lower?
    elif "4" == similarity:
        query_library.select_similar(database, name, "max_players")
    # change to age?
    elif "5" == similarity:
        query_library.select_similar(database, name, "min_play_time")
    # make time more general
    elif "6" == similarity:
        query_library.select_similar(database, name, "max_play_time")

    else:
        pass