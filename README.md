# ted-subtitles-translator

When I saw [this TED talk](https://www.ted.com/talks/elon_musk_the_future_we_re_building_and_boring)
I was disappointed that there are not subtitles in my language.
So I told myself why not to do automatic translator of existing english subtitles ...
This is the result using google translate ...


## installation & config

For install:

```
git clone https://github.com/vencax/ted-subtitles-translator
cd ted-subtitles-translator
npm install
```

Run:

```
npm start
```

## usage

Send GET request to running instance with 2 mandatory query params:

- lang: desired language code
- subtitleurl: url with english subtitles

e.g.:
```
http://localhost:3000/?subtitleurl=https://hls.ted.com/talks/2774/subtitles/en/full.vtt&lang=cs
```
