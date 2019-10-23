# underwater-image-color-correction


## Installation

`npm i underwater-image-color-correction`

## Usage

- ```const getColorFilterMatrix = require('underwater-image-color-correction')```

- ```getColorFilterMatrix(pixels, width, height)```

The arguments in the function is the following:
- __pixels__.  4 Channel pixel array [R0, G0, B0, A0, R1, G1, B1, A1, ...]
- __width__.  The width of the image.
- __heigth__.  The height of the image.

The output of the function is a color filter matrix:
```nodejs
[
    RedRed,     RedGreen,    RedB,       RedA,         RedOffset,
    GreenRed,   GreenGreen,  GreenBlue,  GreenAlpha,   GOffset,
    BlueRed,    BGreen,      BlueBlue,   BlueAlpha,    BOffset,
    AlphaRed,   AlphaGreen,  AlphaBlue,  AlphaAlpha,   AOffset,
]
```

## Motivation



## The algorithm

