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


def update_game(database, column, id):
    """
    update players of a game
    :param conn:
    :param games:
    :return: name
    """
    conn = create_connection(database)
    cur = conn.cursor()
    sql = ''' UPDATE test
              SET ''' + column + ''' = ?
              WHERE id = ?'''
    change = input("What would you like to change " + column + " to?\n")
    cur.execute(sql, (change, id))
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
