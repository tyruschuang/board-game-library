import make_game
import sqlite3
database = r"/Users/kiwi/Desktop/database?/bored.db"


while True:
    # 1. print a welcome.
    #    Welcome!
    #    To exit, press q.
    #    Otherwise, select what you want to do:
    #        1. Find a game of the same type.
    #        2. Add games.
    print("Welcome! To exit, press q.")
    print()
    print("Otherwise, select what you want to do:\n\t1. Find a similar game\n\t2. Add a game\n\t3. Edit a game")
    # 2. read user's input
    command = input("")
    # 3. parse user's input (this is the user 'command'); you could use lots of 'if' statements or a 'switch' statement
    # 3.0 if input matches 'q', break
    if "q" == command:
        break

    # 3.1 if input matches '1', you're going to find a matching game
    if "1" == command:
    # 3.1.1 Ask the user to give you the game name to find something like it
        name = input("What is the name of the game?\n")
        import query_library
        column_names = ["id", "name", "type", "min_players", "max_players", "min_play_time", "max_play_time"]
        game_data_tuple = query_library.get_game_data_by_name(database, name, column_names)
        dictionary = dict(zip(column_names, game_data_tuple))
        #clean up reading of dictionary?
        print("What would you like to be similar to " + name + "?")
        for i in range(0, len(column_names)):
            print("\t" + str(i) + ". " + column_names[i])
        similarity = input("\n")

        if "2" == similarity:
            query_library.select_game_by_type(database)

        elif "3" == similarity:
            query_library.select_game_by_min_players(database)

        elif "4" == similarity:
            query_library.select_game_by_max_players(database)

        elif "5" == similarity:
            query_library.select_game_by_min_play_time(database)

        elif "6" == similarity:
            query_library.select_game_by_max_play_time(database)

        else:
            pass
    # 3.1.2 Call the function to find all matching games

    # 3.2 if input matches '2', you're going to add a game to the database
    # 3.2.1 Ask the user to give you information about the game that you need.
    #       (here, ask for the database to put it in, and the csv_file to get it from)
    # 3.2.2 Call the function to add the new game to your database
    if "2" == command:
        print("Do you want to\n\t1. look for the game information on boardgamegeek.com\n\t2. input the information")
        information = input("\n") 
        if "1" == information:
            print("Please find the game on boardgamegeek.com")
            game_id = input("What is the game id?\n")
            with open("bgg_game.py") as file:
                exec(file.read())
        if "2" == information:
            game_id = input("What is the game id?\n")
            name = input("What is the name of the game?\n")
            game_type = input("What type of game is it?\n")
            min_players = input("What is the minimum amount of players?\n")
            max_players = input("What is the maximum amount of players?\n")
            min_play_time = input("What is the minimum play time?\n")
            max_play_time = input("What is the maximum play time?\n")
            game = (game_id, name, game_type, min_players, max_players, min_play_time, max_play_time)
            print(game)
            make_game.create_game(database, game)
            print("Game added!")
    # to edit a game
    #if "3" == command:
        #game_id = input("What is the ID of the game you would like to edit?\n")




print("All done!")