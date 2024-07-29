DROP TABLE IF EXISTS RecordBasic;

DROP TABLE IF EXISTS RecordDetail;

DROP TABLE IF EXISTS GameRecords;

DROP TABLE IF EXISTS Contests;

-- 赛事列表
CREATE TABLE IF NOT EXISTS Contests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contest_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    nickname TEXT,
    description TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    finish_time TIMESTAMP NOT NULL
);

-- 牌谱记录
CREATE TABLE IF NOT EXISTS GameRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    contest_id INTEGER NOT NULL,
    end_time TIMESTAMP NOT NULL,
    ju_list TEXT NOT NULL,
    FOREIGN KEY (contest_id) REFERENCES Contests(contest_id)
);

-- 牌谱个人详细信息
CREATE TABLE IF NOT EXISTS RecordDetail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    -- basic
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    seat INTEGER NOT NULL,
    score INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    -- player statistics
    hule INTEGER NOT NULL,
    chong INTEGER NOT NULL,
    lizhi INTEGER NOT NULL,
    fulu INTEGER NOT NULL,
    zhuili INTEGER NOT NULL,
    zhenli INTEGER NOT NULL,
    ura INTEGER NOT NULL,
    dadian INTEGER NOT NULL,
    zimo INTEGER NOT NULL,
    dama INTEGER NOT NULL,
    houfu INTEGER NOT NULL,
    zhenting INTEGER NOT NULL,
    -- game statistics
    matchs INTEGER NOT NULL,
    score_list TEXT NOT NULL,
    tags TEXT,
    FOREIGN KEY (uuid) REFERENCES GameRecords(uuid),
    UNIQUE (uuid, user_id)
);