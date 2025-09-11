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


def create_game(database, game):
    """
    Create a new game into the test table
    :param conn:
    :param project:
    :return: project id
    """
    conn = create_connection(database)
    with conn:
        sql = ''' INSERT OR REPLACE INTO test(id,name,type,min_players,max_players,min_play_time,max_play_time)
                VALUES(?,?,?,?,?,?,?) '''
        cur = conn.cursor()
        cur.execute(sql, game)
        conn.commit()
        return cur.lastrowid

def exists_game(database, game_id):
    conn = create_connection(database)
    with conn:
        search = ''' SELECT id FROM test WHERE id = ? '''
        cur = conn.cursor()
        print(game_id)
        cur.execute(search, (game_id,))
        conn.commit()
        return cur.fetchone()

def remove_game(database, game_id):
    conn = create_connection(database)
    with conn:
        res = ''' DELETE FROM test
                WHERE id = ? '''
        cur = conn.cursor()
        print(game_id)
        cur.execute(res, (game_id,))
        conn.commit()
        return cur.lastrowid

def main():
    database = r"/Users/kiwi/Desktop/database?/bored.db"

    if exists_game(database, game_id):
        remove_game(database, game_id)
        print("Game removed!")
    game_create = create_game(database, game)


if __name__ == '__main__':
    main()
