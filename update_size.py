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


def update_game(conn, size):
    """
    update name, length, width, and height of a game
    :param conn:
    :param size:
    :return: name
    """
    sql = ''' UPDATE size
              SET notes = ?
              WHERE id = ?'''
    cur = conn.cursor()
    cur.execute(sql, size)
    conn.commit()


def main():
    database = r"/Users/kiwi/Desktop/database?/games.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        update_game(conn, ("2 copies", 31260))


if __name__ == '__main__':
    main()