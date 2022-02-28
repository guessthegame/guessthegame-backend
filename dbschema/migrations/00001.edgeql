CREATE MIGRATION m1ckihkyusrzpguor2rg6i2yi6gvot35fetigauemvov2dcbtrxkhq
    ONTO initial
{
  CREATE TYPE default::ScreenshotImage {
      CREATE REQUIRED PROPERTY originalUuid -> std::uuid;
      CREATE REQUIRED PROPERTY transformations -> std::json;
      CREATE REQUIRED PROPERTY transformedUuid -> std::uuid;
  };
  CREATE TYPE default::Screenshot {
      CREATE REQUIRED PROPERTY phoneticGameNames -> array<tuple<original: std::str, phonetic: std::str>>;
      CREATE SINGLE LINK image -> default::ScreenshotImage {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY gameName -> std::str;
      CREATE REQUIRED PROPERTY gameReleaseYear -> std::int16;
      CREATE REQUIRED PROPERTY hasBeenValidated -> std::bool {
          SET default := false;
      };
  };
  CREATE TYPE default::UserRefreshToken {
      CREATE REQUIRED PROPERTY expirationDate -> std::datetime;
      CREATE REQUIRED PROPERTY token -> std::str;
  };
  CREATE ABSTRACT TYPE default::User {
      CREATE MULTI LINK addedScreenshots -> default::Screenshot {
          CREATE PROPERTY addedAt -> std::datetime;
      };
      CREATE MULTI LINK refreshTokens -> default::UserRefreshToken;
      CREATE MULTI LINK solvedScreenshots -> default::Screenshot {
          CREATE PROPERTY solvedAt -> std::datetime;
      };
  };
  CREATE TYPE default::AnonymousUser EXTENDING default::User {
      CREATE PROPERTY browserToken -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE SCALAR TYPE default::UserRoleEnum EXTENDING enum<Player, Moderator, Admin>;
  CREATE TYPE default::RegisteredUser EXTENDING default::User {
      CREATE PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY passwordHash -> std::str;
      CREATE REQUIRED PROPERTY role -> default::UserRoleEnum {
          SET default := (default::UserRoleEnum.Player);
      };
      CREATE REQUIRED PROPERTY username -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
