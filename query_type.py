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


def select_game_by_type(conn, game_type):
    """
    Query games by game_type
    :param conn: the Connection object
    :param priority:
    :return:
    """
    cur = conn.cursor()
    # cur.execute("SELECT * FROM games WHERE game_type=?", (game_type,))
    cur.execute("SELECT * FROM games")

    rows = cur.fetchall()

    for row in rows:
        if game_type in row[2]:
            print(row)


def main():
    database = r"/Users/kiwi/Desktop/database?/bored.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        game_type = input("What is the type of the game?")
        print("1. Query games by game_type:")
        select_game_by_type(conn, game_type)


if __name__ == '__main__':
    main()
