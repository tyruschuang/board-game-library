import sqlite3
from sqlite3 import Error

def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)

    return conn


def create_game(conn, game):
    """
    Create a new game into the size table
    :param conn:
    :param project:
    :return: project id
    """
    sql = ''' INSERT INTO size(id, name, length, width, height)
              VALUES(?,?,?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, game)
    conn.commit()
    return cur.lastrowid


def main():
    database = r"/Users/kiwi/Desktop/database?/games.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        # create a new project
        game = (359394, "My Island", 11.5, 11.5, 2.75)
        game_create = create_game(conn, game)


if __name__ == '__main__':
    main()