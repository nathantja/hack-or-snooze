"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** handles click on the submit tab in navbar */
function submitTabClick(evt){
  console.debug("submitTabClick", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
  $submitArea.show();
}

$submitTab.on('click',submitTabClick);

/** handles click on the favorites tab in navboar */
function favoritesTabClick(evt){
  console.debug("favoritesTabClick", evt);
  evt.preventDefault();
  hidePageComponents();
  putFavoritesOnPage();
}

$favoritesTab.on('click',favoritesTabClick);


/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  hidePageComponents();
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  putStoriesOnPage();
}


