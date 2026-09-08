CREATE TABLE Verse (
  ID INTEGER PRIMARY KEY, Gurmukhi TEXT, GurmukhiUni TEXT,
  Translations TEXT, Transliterations TEXT, Visraam TEXT,
  PageNo INTEGER, LineNo INTEGER, SourceID TEXT,
  WriterID INTEGER, RaagID INTEGER, Updated TEXT
);
CREATE TABLE Shabad (VerseID INTEGER, ShabadID INTEGER, Updated TEXT);
CREATE TABLE Writer (WriterID INTEGER PRIMARY KEY, WriterEnglish TEXT, WriterGurmukhi TEXT, WriterUnicode TEXT);
CREATE TABLE Raag (RaagID INTEGER PRIMARY KEY, RaagGurmukhi TEXT, RaagUnicode TEXT, RaagEnglish TEXT, RaagWithPage TEXT);
CREATE TABLE Source (SourceID TEXT PRIMARY KEY, SourceGurmukhi TEXT, SourceUnicode TEXT, SourceEnglish TEXT);
CREATE INDEX idx_Verse_PageNo_Source ON Verse(PageNo, SourceID);
CREATE INDEX idx_Shabad_VerseID ON Shabad(VerseID);

INSERT INTO Source VALUES ('G', 'sRI gurU gRMQ swihb jI', 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ', 'Sri Guru Granth Sahib Ji');
INSERT INTO Source VALUES ('D', 'dsm bwxI', 'ਦਸਮ ਬਾਣੀ', 'Dasam Bani');
INSERT INTO Writer VALUES (1, 'Guru Nanak Dev Ji', 'mÚ 1', NULL);
INSERT INTO Raag VALUES (1, 'jp', 'ਜਪ', 'Jap', 'Jap (1-8)');

-- Small test rows exercise the real snapshot schema; they are not a Gurbani distribution.
INSERT INTO Verse VALUES
  (10, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{"en":{"test":"Test translation"},"pu":{"test":"ascii"},"puu":{"test":"unicode"}}', '{"en":"sat naam","hi":"सति नामु"}', '{"sttm":[{"p":1,"t":"v"}],"sttm2":[],"igurbani":[]}', 1, 2, 'G', 1, 1, '2026-01-01 00:00:00'),
  (12, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{}', '{}', '{}', 1, 1, 'G', 1, 1, '2026-01-01 00:00:00'),
  (11, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{}', '{}', '{}', 1, 1, 'G', 1, 1, '2026-01-01 00:00:00'),
  (20, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{}', '{}', '{}', 3, 1, 'G', NULL, NULL, '2026-01-01 00:00:00'),
  (30, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{}', '{}', '{}', 1, 1, 'D', 1, 1, '2026-01-01 00:00:00'),
  (40, 'siq nwmu', 'ਸਤਿ ਨਾਮੁ', '{}', '{}', '{}', 2, 1, 'G', 1, 1, '2026-01-01 00:00:00');
INSERT INTO Shabad VALUES
  (10, 1, '2026-02-01 00:00:00'), (11, 1, '2026-01-01 00:00:00'),
  (12, 1, '2026-01-01 00:00:00'), (20, 2, '2026-01-01 00:00:00'),
  (30, 3, '2026-01-01 00:00:00'), (40, 5000001, '2026-01-01 00:00:00');
