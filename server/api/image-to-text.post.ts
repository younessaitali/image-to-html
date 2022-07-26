import type { RGBA } from '@jimp/core'
import formidable from 'formidable'
import type { IncomingMessage } from 'h3'
import { sendError } from 'h3'
import Jimp from 'jimp-compact'
import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'


function getPixelColor(image: Jimp, x: number, y: number) {
  return Jimp.intToRGBA(image.getPixelColor(x, y))
}

interface Pixel {
  char: string
  color: RGBA
}

export type OutputData = Pixel[][]

// Convert image to text version
async function convertImage(image: Jimp): Promise< Result<string, Error>> {
  const options = {
    width: image.bitmap.width,
    height: image.bitmap.height,
    c_ratio: 4,
    color: true,
  }

// characters to use in the output ordered by brightness

  const characters = '10'


// resize the image for optimal performance

  image.resize(Math.trunc(options.width * 0.2), Math.trunc(options.height * 0.2))

  //   const html: Pixel[][] = []

    let html = ''

    /**
     * normalization   - normalize the image to to map the colors to the characters
     *  255 - 0 is the range of the colors
     *  3 is number of colors (r,g,b)
     * I did this to make the output more uniform and render each color with the same char.
     *  when I use random characters the output look a little bit off. because of small deference in size of character.
     * */

    const normalization= (255 * 3 / (characters.length - 1))

  for (let j = 0; j < image.bitmap.height; j++) {
    html += '<p>'

    for (let i = 0; i < image.bitmap.width; i++) {
      for (let c = 0; c < options.c_ratio; c++) {
        const pixelColor = getPixelColor(image, i, j)
        const pixelIntensity = (pixelColor.r + pixelColor.g + pixelColor.b )
        const next = characters[Math.round(pixelIntensity / normalization)]

        html += `<span style="color:rgba(${pixelColor.r},${pixelColor.g},${pixelColor.b},${pixelColor.a})">${next}</span>`
        // html[j].push({ char: next, color: pixelColor })
      }
    }
    html += '</p>'
  }

  return ok(html)
}

async function getImagePath(imageData: IncomingMessage): Promise<Result<string, Error>> {
  const form = formidable()

  return await new Promise<Result<string, Error>>((resolve, reject) => {
    form.parse(imageData, async (err, _fields, files) => {
      if (err) {
        reject(err(Error('something went wrong with the form')))
        return
      }

      if (Array.isArray(files.file)) {
        reject(err(Error('Too many files')))
        return
      }

      resolve(ok(files.file.filepath))
    })
  })
}

async function parseImageData(imageData: IncomingMessage): Promise <Result<Jimp, Error>> {
  const imagePath = await getImagePath(imageData)

  if (imagePath.isErr())
    return err(imagePath.error)

  const image = await Jimp.read(imagePath.value)

  return ok(image)
}

export default defineEventHandler(async (event) => {
  const imageData = await parseImageData(event.req)
  if (imageData.isErr()) {
    event.res.statusCode = 400
    return sendError(event, imageData.error)
  }

  const image = await convertImage(imageData.value)

  if (image.isErr()) {
    event.res.statusCode = 400
    return sendError(event, image.error)
  }

  return image.value
})
