import { getXataClient } from "@/lib/xata"

const xata = getXataClient();


export default async function hanlder(req, res) {

    const {siteUrl, images, dateCollected } = JSON.parse(req.body)
    
    if(images === []){
        console.log("Images are not there")

        return
    }
    const siteRecord = await xata.db.Sites.create({
        siteUrl,
        dateCollected
    });

    const imagesToCache = images.map(image => {
        return {
            ...image,
            optimized: JSON.stringify(image.optimized),
            upload: JSON.stringify(image.upload),
            original: JSON.stringify(image.original),
            siteUrl,
        }
    })

    const imagesRecords = await xata.db.Images.create(imagesToCache);



    res.status(200).json({
        status: 'ok'
    })
}