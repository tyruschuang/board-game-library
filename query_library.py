import sqlite3
from sqlite3 import Error


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by the db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)

    return conn

    
def get_game_by_name(database, name):
    """
    Get game by name
    :param database: the string describing the path to the database
    """
    get_game_data_by_name(database, name, ("*",))

def get_game_data_by_name(database, name, column_names):
    """
    Get game by name
    :param database: the string describing the path to the database
    """
    conn = create_connection(database)
    with conn:
        cur = conn.cursor()
        command = "SELECT " + ", ".join(column_names) + ' FROM test WHERE name = ' + "'" + name + "'"
        cur.execute(command)
        row = cur.fetchone()
        return row
    

def select_similar(database, name, sim):
    """
    Query games by duration
    :param conn: the Connection object
    :param duration:
    :return:
    """
    conn = create_connection(database)
    with conn:
        print("\n1. Query games by " + sim)
    
        cur = conn.cursor()
        cur.execute("SELECT name FROM test WHERE " + sim + "=?", (get_game_data_by_name(database, name, [sim])))

        rows = cur.fetchall()

        for row in rows:
            print(row)


def select_game_by_type(database):
    """
    Query games by game_type
    :param conn: the Connection object
    :param game_type:
    :return:
    """
    game_type = input("What is the type of the game?\n")
    conn = create_connection(database)
    rows = []
    with conn:
        print("1. Query games by game_type:")
    
        cur = conn.cursor()
    # cur.execute("SELECT * FROM test WHERE game_type=?", (game_type,))
        cur.execute("SELECT * FROM test")

        rows = cur.fetchall()

    for row in rows:
        if game_type in row[2]:
            print(row)


def select_game_by_min_players(database, name):
    """
    Query games by duration
    :param conn: the Connection object
    :param duration:
    :return:
    """
    # min_players = input("What is the game's minimum players?\n")
    conn = create_connection(database)
    with conn:
        print("1. Query games by minimum players:")
    
        cur = conn.cursor()
        cur.execute("SELECT name FROM test WHERE min_players=?", (get_game_data_by_name(database, name, ["min_players"])))

        rows = cur.fetchall()

        for row in rows:
            print(row)


def select_game_by_max_players(database, name):
    """
    Query games by duration
    :param conn: the Connection object
    :param duration:
    :return:
    """
    # max_players = input("What is the game's maximum players?\n")
    conn = create_connection(database)
    with conn:
        print("1. Query games by maximum players:")
    
        cur = conn.cursor()
        cur.execute("SELECT name FROM test WHERE max_players=?", (get_game_data_by_name(database, name, ["max_players"])))

        rows = cur.fetchall()

        for row in rows:
            print(row)


def select_game_by_min_play_time(database, name):
    """
    Query games by duration
    :param conn: the Connection object
    :param duration:
    :return:
    """
    min_play_time = input("What is the game's minimum play time?\n")
    conn = create_connection(database)
    with conn:
        print("1. Query games by minimum play time:")
    
        cur = conn.cursor()
        cur.execute("SELECT name FROM test WHERE min_play_time=?", (get_game_data_by_name(database, name, ["min_play_time"])))

        rows = cur.fetchall()

        for row in rows:
            print(row)


def select_game_by_max_play_time(database, name):
    """
    Query games by duration
    :param conn: the Connection object
    :param duration:
    :return:
    """
    max_play_time = input("What is the game's maximum play time?\n")
    conn = create_connection(database)
    with conn:
        print("1. Query games by maximum play time:")
    
        cur = conn.cursor()
        cur.execute("SELECT name FROM test WHERE max_play_time=?", (get_game_data_by_name(database, name, ["max_play_time"])))

        rows = cur.fetchall()

        for row in rows:
            print(row)