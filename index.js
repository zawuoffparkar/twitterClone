import { tweetsData as mainData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

//to make local stoarage work - we need to first check if there is a saved data in the storage, if do so, we show that.
const savedTweet = localStorage.getItem("tweet"); //basically getting the item "tweet" from the local storage and saving it, and then using it later to reassign it to tweetsData

let tweetsData;

if (savedTweet) {
  tweetsData = JSON.parse(savedTweet);
} else {
  tweetsData = mainData;
}

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.deleteTweet) {
    handleDeleteClick(e.target.dataset.deleteTweet);
    console.log(e.target.dataset.deleteTweet);
  } else if (e.target.dataset.replyTweet) {
    replyTweetBtnClick(e.target.dataset.replyTweet);
  }
});

function syncTweets() {
  localStorage.setItem("tweet", JSON.stringify(tweetsData));
}

function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isLiked) {
    targetTweetObj.likes--;
  } else {
    targetTweetObj.likes++;
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  syncTweets();
  render();
}

function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  if (targetTweetObj.isRetweeted) {
    targetTweetObj.retweets--;
  } else {
    targetTweetObj.retweets++;
  }
  targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  syncTweets();
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

function handleDeleteClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  // can use indexOf method for knowing the index of a something in an array.
  const targetTweetDelete = tweetsData.indexOf(targetTweetObj);
  // console.log(targetTweetDelete)
  // basically can use splice to remove something in an array at a specific index
  tweetsData.splice(targetTweetDelete, 1);
  syncTweets();
  render();
}

function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");
  const newTweet = {
    handle: `@Scrimba`,
    profilePic: `images/scrimbalogo.png`,
    likes: 0,
    retweets: 0,
    tweetText: tweetInput.value,
    replies: [],
    isLiked: false,
    isRetweeted: false,
    uuid: uuidv4(),
  };
  if (tweetInput.value) {
    tweetsData.unshift(newTweet);
    syncTweets();
    render();
    tweetInput.value = "";
  }
}

function replyTweetBtnClick(tweetId) {
  const replyInput = document.getElementById(`reply-input-${tweetId}`);
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];
  if (replyInput.value) {
    targetTweetObj.replies.unshift({
      handle: `@Scrimba`,
      profilePic: `images/scrimbalogo.png`,
      tweetText: replyInput.value,
    });
    syncTweets();
    render();
  }

  console.log(targetTweetObj.replies);
  // render()
}

function getFeedHtml() {
  let feedHtml = ``;

  tweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    if (tweet.isLiked) {
      likeIconClass = "liked";
    }

    let retweetIconClass = "";

    if (tweet.isRetweeted) {
      retweetIconClass = "retweeted";
    }

    let repliesHtml = `
        <div class="tweet-reply">
			<img src="images/scrimbalogo.png" class="profile-pic">
			<textarea placeholder="What's happening?" id="reply-input-${tweet.uuid}"></textarea>
	    </div>
		<button id="reply-btn" data-reply-tweet= "${tweet.uuid}">Reply</button>
        `;

    if (tweet.replies.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
     </div>

</div>
`;
      });
    }

    feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-trash-can" data-delete-tweet="${tweet.uuid}"></i>

                </span>
            </div>
        </div>
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>
</div>
`;
  });
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}

render();
