// Generated by CoffeeScript 2.0.2
var SourceMapConsumer, SourceMapGenerator, path, readFileSync, writeFileSync;

({readFileSync, writeFileSync} = require('fs'));

path = require('path');

({SourceMapConsumer, SourceMapGenerator} = require('source-map'));

exports.cat = function(inputMapFiles, outJSFile, outMapFile, maproot) {
  var buffer, f, generator, i, len, lineOffset, map, src, srcPath;
  buffer = [];
  generator = new SourceMapGenerator({
    file: outJSFile
  });
  lineOffset = 0;
  for (i = 0, len = inputMapFiles.length; i < len; i++) {
    f = inputMapFiles[i];
    map = new SourceMapConsumer(readFileSync(f, 'utf-8'));
    // concatenate the file
    srcPath = path.join(path.dirname(f), map.file);
    src = readFileSync(srcPath, 'utf-8');
    src = src.replace(/\/\/[@#]\ssourceMappingURL[^\r\n]*/g, '//');
    buffer.push(src);
    // add all mappings in this file
    map.eachMapping(function(mapping) {
      var oriContent, origSrc;
      oriContent = mapping.source && map.sourceContentFor(mapping.source);
      origSrc = mapping.source && path.join(path.dirname(f), mapping.source);
      mapping = {
        generated: {
          line: mapping.generatedLine + lineOffset,
          column: mapping.generatedColumn
        },
        original: {
          line: mapping.originalLine || "1",
          column: mapping.originalColumn || "1"
        },
        source: origSrc ? path.relative(path.dirname(outMapFile), origSrc) : 'unknown:/'
      };
      if (oriContent !== null) {
        generator.setSourceContent(mapping.source, oriContent);
      }
      return generator.addMapping(mapping);
    });
    // update line offset so we could start working with the next file
    lineOffset += src.split('\n').length;
  }
  if (maproot === null) {
    buffer.push(`//# sourceMappingURL=${path.relative(path.dirname(outJSFile), outMapFile)}`);
  } else {
    buffer.push(`//# sourceMappingURL=${maproot + path.relative(path.dirname(outJSFile), outMapFile)}`);
  }
  writeFileSync(outJSFile, buffer.join('\n'), 'utf-8');
  return writeFileSync(outMapFile, generator.toString(), 'utf-8');
};
