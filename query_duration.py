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


def select_game_by_duration(conn, duration):
    """
    Query games by duration
    :param conn: the Connection object
    :param priority:
    :return:
    """
    cur = conn.cursor()
    cur.execute("SELECT * FROM games WHERE duration=?", (duration,))

    rows = cur.fetchall()

    for row in rows:
        print(row)


def main():
    database = r"/Users/kiwi/Desktop/database?/bored.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        print("1. Query games by duration:")
        select_game_by_duration(conn, 90)


if __name__ == '__main__':
    main()
