# LinkGist

LinkGist is a minimalist React app designed to simplify sharing `.ics` files stored on GitHub Gist. By constructing a URL with specific parameters, users can easily add calendar events directly from their mobile browsers, eliminating the need for email attachments.

## Usage

Construct a URL with the following query parameters:

- `title` (string): The title of the event.
- `gistid` (string): The GitHub Gist ID containing the `.ics` file.
- `rev` (string, optional): Specific revision of the Gist.
- `button` (string, optional): Custom button text.
- `descr` (string, optional): Description text (`0` to hide).

**Example:**

`https://tmrk.github.io/linkgist/?title=Meeting&gistid=YOUR_GIST_ID&button=Add+Event&descr=Team+meeting+description`

**License**

MIT