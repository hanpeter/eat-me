CREATE TABLE IF NOT EXISTS users (
    user_id text PRIMARY KEY,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS shops (
    biz_id text NOT NULL,
    user_id text REFERENCES users(user_id),
    list_order integer NOT NULL,
    has_eaten boolean DEFAULT FALSE,
    PRIMARY KEY(biz_id, user_id)
);
