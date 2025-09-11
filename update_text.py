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


def update_game(conn, games):
    """
    update players of a game
    :param conn:
    :param games:
    :return: name
    """
    sql = ''' UPDATE games
              SET players = ?
              WHERE name = ?'''
    cur = conn.cursor()
    cur.execute(sql, games)
    conn.commit()


def main():
    database = r"/Users/kiwi/Desktop/database?/bored.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        people = input('How many players?')
        game_name = input("What is the game's name?")
        update_game(conn, (people, game_name))


if __name__ == '__main__':
    main()
