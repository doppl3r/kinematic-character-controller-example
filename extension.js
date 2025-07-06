import gulp from 'gulp';
import zip from 'gulp-zip';
import { readFileSync } from 'fs';

let packagePath = './package.json';
let packageFile = readFileSync(packagePath, 'utf8');
let version = JSON.parse(packageFile).version;

function zipBuildFiles(platform = 'chrome', callback = () => {}) {
  // Build Chrome file
  gulp
    .src(['./build/**/*'], { encoding: false })
    .pipe(zip(`kinematic-character-controller-${ version }-${ platform }.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist'))
    .on('end', callback); // Execute callback
}

// Start zipping
zipBuildFiles('chrome');