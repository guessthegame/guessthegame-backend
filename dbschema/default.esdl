module default {
  # ==============
  # = Screenshot =
  # ==============
  # 
  type Screenshot {
    # Official canonical game name
    required property gameName -> str;

    # Game release year
    required property gameReleaseYear -> int16;

    # Users' guesses will be tested against those phonetic names
    required property phoneticGameNames -> array<
      tuple<
        original: str,
        phonetic: str,
      >
    >;

    # Has been validated by a moderator
    required property hasBeenValidated -> bool { default := false; };

    # Has one image
    single link image -> ScreenshotImage {
      constraint exclusive
    };
  }

  type ScreenshotImage {
    # uuids of image files
    required property originalUuid -> uuid;
    required property transformedUuid -> uuid;

    # All transformations the image has gone through
    required property transformations -> json;
  }


  # ========
  # = User =
  # ========
  #
  scalar type UserRoleEnum extending enum<Player, Moderator, Admin>;

  abstract type User {
    # Has many refresh tokens
    multi link refreshTokens -> UserRefreshToken;

    # Has solved many screenshots
    multi link solvedScreenshots -> Screenshot {
      property solvedAt -> datetime;
    };

    # Has added many screenshots
    multi link addedScreenshots -> Screenshot {
      property addedAt -> datetime;
    };
  }

  type AnonymousUser extending User {
    # Anonymous users are identified via a token stored in the browser
    property browserToken -> str {
      constraint exclusive;
    };
  }

  type RegisteredUser extending User {
    # Username
    required property username -> str {
      constraint exclusive;
    };

    # Password Hash
    required property passwordHash -> str;

    # Email (not required upon sign-up)
    property email -> str {
      constraint exclusive;
    };

    # Role
    required property role -> UserRoleEnum { default := UserRoleEnum.Player };
  }

  type UserRefreshToken {
    required property token -> str;
    required property expirationDate -> datetime;
  };
}
