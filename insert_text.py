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
    Create a new game into the games table
    :param conn:
    :param game:
    :return: game_no
    """
    sql = ''' INSERT INTO games(game_no,name,type,duration, players)
              VALUES(?,?,?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, game)
    conn.commit()
    return cur.lastrowid


def main(database, csv_file):
    import csv

    conn = create_connection(database)
    with conn:
        with open (csv_file, "r") as f:
            reader = csv.reader(f)
            data = next(reader) 
            query = 'insert into games values ({0})'
            query = query.format(','.join('?' * len(data)))
            cursor = conn.cursor()
            cursor.execute(query, data)
            for data in reader:
                cursor.execute(query, data)
            conn.commit()


if __name__ == '__main__':
    main(r"/Users/kiwi/Desktop/database?/bored.db", "/users/kiwi/Desktop/database?/bored_games.csv")
