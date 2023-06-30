export const config = {
    runtime: 'edge'
  }
  
  export default async function handler(req) {
    let url = req.nextUrl.searchParams.get('url');
  
    const params = {
        api_key: process.env.SCRAPINGBEE_API_KEY,
        url,
        extract_rules: '{"images":{"selector":"img","type":"list","output":{"src":"img@src","alt":"img@alt",}}}',
      };
      
    const paramsString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
    
    const { images } = await fetch(`https://app.scrapingbee.com/api/v1?${paramsString}`).then(r => r.json());
    
    const newImage = images.map((image, key) => {
      if (typeof image.src === 'string' && (image.src.startsWith('//') || image.src.startsWith('./') || image.src.startsWith('/') || image.src.startsWith(''))) {
        console.log(image, 'image')
        return image.src = `${params.url}${image.src}`;
      }
    });

       
     

        console.log(newImage, 'img')
      
  
    console.log(images[0].src)
    return new Response(JSON.stringify({
      images
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      }
    })
  }