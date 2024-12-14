import { FileLoader } from 'three';

class AssetJSONLoader extends FileLoader {
  constructor(manager) {
    super(manager);
    this.setMimeType('application/json');
    this.setResponseType('json');
  }

  async load(url) {
    try {
      var response = await fetch(url);
      var json = await response.json();

      // Loop through json keys and values
      for (const [key, value] of Object.entries(json)) {
        super.load(value.url, function(data) {
          // Store the file in cache
          this.manager.cache[key] = data;
        }.bind(this),
        function(xhr) {
          
        },
        function(error) {
          console.error(`Error: File ${ value.url } not found.`);
        });
      }
    }
    catch (error) {
      console.error(error);
    };
  }

  duplicate(file) {
    return JSON.parse(JSON.stringify(file));;
  }
}

export { AssetJSONLoader };