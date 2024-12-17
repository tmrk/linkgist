import React, { useEffect, useState } from 'react';

function App() {
  const [title, setTitle] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    // Parse URL search params
    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    const gistid = params.get('gistid');
    const rev = params.get('rev');
    const buttonParam = params.get('button');
    const descrParam = params.get('descr');

    // Set document title
    if (titleParam) {
      document.title = titleParam;
      setTitle(titleParam);
    } else {
      document.title = "Link to Gist";
      setTitle("Link to Gist");
    }

    // If gistid not provided
    if (!gistid) {
      setError('No gist ID provided. Cannot load file.');
      // Still show the page but we cannot proceed further
      return;
    }

    // Fetch Gist info from GitHub API
    // Gist API: https://api.github.com/gists/{id}
    fetch(`https://api.github.com/gists/${gistid}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load Gist info');
        }
        return res.json();
      })
      .then(data => {
        // Check revision if rev is defined
        let fileUrl = '';
        let fileExtension = '';
        if (rev) {
          // Find the revision in history
          const revision = data.history.find(h => h.version.startsWith(rev));
          if (!revision) {
            throw new Error('Specified revision not found.');
          }
          // The revision object also has files, so we need to map them
          // Actually, each gist always has `files` at top-level and revision gives us a version.
          // The revision does not always store separate files object at revision level in the API.
          // Instead, we might just trust the top-level files for the raw_url.
          // If the revision is critical, you might need to fetch from another endpoint,
          // but Gist doesn't provide raw_url by revision easily. We'll assume top-level is fine.
          // If we must adhere strictly: The problem states "If $rev is defined use that to find that revision."
          // Gist revisions have a separate endpoint: `https://api.github.com/gists/${gistid}/${sha}`
          // Let's do a second fetch if rev is defined:

          return fetch(`https://api.github.com/gists/${gistid}/${rev}`)
            .then(r => {
              if (!r.ok) {
                throw new Error('Failed to load specified revision of Gist');
              }
              return r.json();
            })
            .then(revData => {
              return { data: revData, buttonParam, descrParam };
            });

        } else {
          return { data, buttonParam, descrParam };
        }
      })
      .then(({ data, buttonParam, descrParam }) => {
        if (!data || !data.files || Object.keys(data.files).length === 0) {
          throw new Error('No files found in this Gist.');
        }
        // We’ll just take the first file
        const firstFileKey = Object.keys(data.files)[0];
        const gistFile = data.files[firstFileKey];

        if (!gistFile || !gistFile.raw_url) {
          throw new Error('No raw_url found for the Gist file.');
        }

        // Determine button text:
        // If buttonParam is defined, use it.
        // Else if extension is .ics, "Add to calendar", else "Download"
        let finalButtonText = '';
        if (buttonParam) {
          finalButtonText = buttonParam;
        } else {
          const fileName = gistFile.filename;
          const ext = fileName.substring(fileName.lastIndexOf('.') + 1);
          if (ext.toLowerCase() === 'ics') {
            finalButtonText = "Add to calendar";
          } else {
            finalButtonText = "Download";
          }
        }

        // Determine description:
        // if descrParam === "0" -> do not display
        // if descrParam is a string -> display that
        // if descrParam is undefined -> use gist description from API
        let finalDescription = '';
        if (descrParam === '0') {
          finalDescription = '';
        } else if (descrParam) {
          finalDescription = descrParam;
        } else {
          // Use gist description
          finalDescription = data.description || '';
        }

        setButtonText(finalButtonText);
        setDescription(finalDescription);
        setDownloadUrl(gistFile.raw_url);
      })
      .catch(err => {
        // On error, handle gracefully
        console.error(err);
        if (!error) { // if we haven't set a gistid error before
          setError('An error occurred while loading the Gist. ' + err.message);
        }
      });

  }, []);

  return (
    <div className="container">
      <h1>{title}</h1>
      {downloadUrl && (
        <div className="button-wrapper">
          <a className="link-button" href={downloadUrl} target="_blank" rel="noopener noreferrer">
            {buttonText}
          </a>
        </div>
      )}
      {description && (
        <div className="description">{description}</div>
      )}
      {error && (
        <div className="error">{error}</div>
      )}
    </div>
  );
}

export default App;
