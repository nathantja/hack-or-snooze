"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="bi bi-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  // saved favorites function here
  $allStoriesList.show();
}


/** Function gets data from the submit form, adds story to storylist, and
then puts that new story on the page.
 *
 */
async function submitStoryAndDisplay(evt) {
  evt.preventDefault();
  // Get data from the submit form
  const author = $submitAuthorInput.val();
  const title = $submitTitleInput.val();
  const url = $submitUrlInput.val();

  const newStory = { title, author, url };

  // .addStory instance method
  const newSingleStory = await storyList.addStory(currentUser, newStory);

  // Display stories on page
  const prependStory = generateStoryMarkup(newSingleStory);
  $allStoriesList.prepend(prependStory);


  //Clear submit form input values
  $('.submit-input').val("");

  //hides submit form once complete
  $submitArea.hide();
}

/** handles click for story submission form */
$submitBtn.on("click", submitStoryAndDisplay);


/** Handler function when an empty star is clicked. Locates the parent li story
Id and passes it to the addFavorite method.
 */
async function clickEmptyStar(evt) {
  $(evt.target).attr('class', 'bi bi-star-fill');
  const clickedStoryId = $(evt.target).closest('li').attr('id');

  const story = Story.findStoryFromId(clickedStoryId);

  await currentUser.addFavorite(story);
}

/** Event delegation to handle click of empty star */
$allStoriesList.on("click", ".bi-star", clickEmptyStar);


/** Handler function when an filled star is clicked. Locates the parent li story
Id and passes it to the removeFavorite method.
 */
async function clickFilledStar(evt) {
  $(evt.target).attr('class', 'bi bi-star');
  const clickedStoryId = $(evt.target).closest('li').attr('id');

  const story = Story.findStoryFromId(clickedStoryId);

  await currentUser.removeFavorite(story);
}

/** Event delegation to handle click of filled star */
$allStoriesList.on("click", ".bi-star-fill", clickFilledStar);



/** Get list of stories from user's favorites array, generates their HTML, and
puts on page.
 */
function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  // saved favorites function here

  $allStoriesList.show();
}


function rememberFavorites() {

// look at favorites - if they exist in $allStoriesList (ol), then change class to bi-star-fill
// currentUser.favorites array -

const $allStoryListItems = $("#all-stories-list > li");
const favorites = currentUser.favorites;
let listOfFavoritesIds = [];

favorites.forEach((story) => listOfFavoritesIds.push(story.storyId))

$allStoryListItems.each(function($li){
  if (listOfFavoritesIds.includes($li.attr("id"))){
    $li.closest('i').attr('class','bi bi-star-fill')
  }

});

}