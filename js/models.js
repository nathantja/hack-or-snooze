"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/hostname
  getHostName() {
    const url = new URL(`${this.url}`);

    return url.hostname;
  }

  /** returns the story from the storyList matching the given story Id.
 * @returns Story instance */
static findStoryFromId(Id) {
  const storiesArray = storyList.stories;

  for (let i = 0; i < storiesArray.length; i++) {
    if (storiesArray[i].storyId === Id) {
      return storiesArray[i];
    }
  }
}
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
    });
    const storiesData = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = storiesData.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    // POST request to the API
    const userToken = user.loginToken;
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      body: JSON.stringify({
        token: userToken,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: newStory.url
        }
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    // MAKE A STORY INSTANCE
    const storyData = await response.json();
    const { storyId, title, author, url, username, createdAt } = storyData.story;

    // ADD TO STORY LIST
    const story = new Story({ storyId, title, author, url, username, createdAt });
    storyList.stories.unshift(story);


    // RETURN NEW STORY
    return story;
  }

}








/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password, name } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const tokenParams = new URLSearchParams({ token });

      const response = await fetch(
        `${BASE_URL}/users/${username}?${tokenParams}`,
        {
          method: "GET"
        }
      );
      const userData = await response.json();
      const { user } = userData;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /** Allow the user to add a story to favorites. Favorites is updated via an
   * API request and also added to the current user instance's favorites array.
   * Method parameter takes a Story instance. */
  async addFavorite(story) {

    const username = currentUser.username;
    const storyId = story.storyId;
    const token = currentUser.loginToken;

    // API request to add favorite to the user's account
    const response = await fetch(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: `${token}` })
      }
    );

    // Add favorite to the currentUser's favorites array
    currentUser.favorites.push(story);

  }


    /** Remove a favorite story from the user's profile. Favorite is removed via
   * an API request and also removed from the current user instance's favorites
   * array.
   * Method parameter takes a Story instance. */
  async removeFavorite(story) {
    debugger;
    const username = currentUser.username;
    const storyId = story.storyId;
    const token = currentUser.loginToken;

    // API request to remove favorite from the user's account
    const response = await fetch(
      `${BASE_URL}/users/${username}/favorites/${storyId}`,
      {
        method : "DELETE",
        headers : { "Content-Type": "application/json" },
        body: JSON.stringify({ token: `${token}` })

      }
    );

    // Remove favorite from the currentUser's favorites array
    const indexToRemove = currentUser.favorites.indexOf(story);
    currentUser.favorites.splice(indexToRemove, 1);
  }

}
