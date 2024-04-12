CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alternative_name VARCHAR(100),
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    alternative_title VARCHAR(100),
    series VARCHAR(100),
    author_id INT NOT NULL,
    cover_url VARCHAR(255),
    date VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (author_id) REFERENCES authors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    alternative_title VARCHAR(100),
    lyric TEXT,
    composer VARCHAR(100),
    lyricist VARCHAR(100),
    ccli VARCHAR(15),
    copyright_year VARCHAR(15),
    song_key VARCHAR(10),
    song_type VARCHAR(15) NOT NULL,
    additional_info TEXT,
    album_id INT,
    author_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (album_id) REFERENCES albums(id),
    FOREIGN KEY (author_id) REFERENCES authors(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE songs 
ADD structured_lyric TEXT;

ALTER TABLE songs 
MODIFY COLUMN structured_lyric JSON,
MODIFY COLUMN additional_info JSON;

ALTER TABLE songs 
MODIFY COLUMN copyright_year nvarchar(100);