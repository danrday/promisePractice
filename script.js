console.log('test')


function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}




var storyDiv = document.querySelector('.story');

function getJSON(url) {
  return get(url).then(JSON.parse).catch(function(err) {
    console.log("getJSON failed for", url, err);
    throw err;
  });
}


function addHtmlToPage(content) {
  var div = document.createElement('div');
  div.innerHTML = content;
  storyDiv.appendChild(div);
}

function addTextToPage(content) {
  var p = document.createElement('p');
  p.textContent = content;
  storyDiv.appendChild(p);
}


// getJSON('story.json').then(function(story) {
//   addHtmlToPage(story.heading);
//   return story.chapterUrls.reduce(function(sequence, chapterUrl) {
//     console.log("sequence:", sequence)
//     // Once the last chapter's promise is done…
//     return sequence.then(function() {
//       // …fetch the next chapter
//       console.log("sequence2", sequence)
//       return getJSON(chapterUrl);
//     }).then(function(chapter) {
//       // and add it to the page
//       addHtmlToPage(chapter.html);
//     });
//   }, Promise.resolve());
// }).then(function() {
//   // And we're all done!
//   addTextToPage("All done");
// }).catch(function(err) {
//   // Catch any error that happened along the way
//   addTextToPage("Argh, broken: " + err.message);
// }).then(function() {
//   // Always hide the spinner
//   document.querySelector('.spinner').style.display = 'none';
// })

getJSON('story.json').then(function(story) {
  addHtmlToPage(story.heading);

  // Map our array of chapter urls to
  // an array of chapter json promises.
  // This makes sure they all download parallel.
  return story.chapterUrls.map(getJSON)
    .reduce(function(sequence, chapterPromise) {
      // Use reduce to chain the promises together,
      // adding content to the page for each chapter
      return sequence.then(function() {
        // Wait for everything in the sequence so far,
        // then wait for this chapter to arrive.
        return chapterPromise;
      }).then(function(chapter) {
        addHtmlToPage(chapter.html);
      });
    }, Promise.resolve());
}).then(function() {
  addTextToPage("All done");
}).catch(function(err) {
  // catch any error that happened along the way
  addTextToPage("Argh, broken: " + err.message);
}).then(function() {
  document.querySelector('.spinner').style.display = 'none';
})
