def search(database):
    name = input("What is the name of the game?\n")
    import query_library
    column_names = ["id", "name", "type", "min_players", "max_players", "min_play_time", "max_play_time"]
    game_data_tuple = query_library.get_game_data_by_name(database, name, column_names)
    dictionary = dict(zip(column_names, game_data_tuple))
    print(dictionary)
    #clean up reading of dictionary?
    print("What would you like to be similar to " + name + "?")
    for i in range(1, len(column_names)):
        print("\t" + str(i) + ". " + column_names[i])
    similarity = input("\n")
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

def edit(database):
    name = input("What is the name of the game?\n")
    import query_library
    import edit_game
    column_names = ["id", "name", "type", "min_players", "max_players", "min_play_time", "max_play_time"]
    game_data_tuple = query_library.get_game_data_by_name(database, name, column_names)
    dictionary = dict(zip(column_names, game_data_tuple))
    #clean up reading of dictionary?
    print("What would you like to edit about " + name + "?")
    for i in range(1, len(column_names)):
        print("\t" + str(i) + ". " + column_names[i])
    edit = input("\n")
    id = game_data_tuple[0]
    print(id)
    if "2" == edit:
        edit_game.update_game(database, "name", id)
    # right now exactly that many min_players, also lower?
    elif "3" == edit:
        edit_game.update_game(database, "min_players", id)
    # exactly max, also lower?
    elif "4" == edit:
        edit_game.update_game(database, "max_players", id)
    # change to age?
    elif "5" == edit:
        edit_game.update_game(database, "min_play_time", id)
    # make time more general
    elif "6" == edit:
        edit_game.update_game(database, "max_play_time", id)

    else:
        pass