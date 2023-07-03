import { useState, useEffect } from 'react';
import {co2} from '@tgwf/co2';
import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import Button from '@/components/Button';
import { CldImage, getCldImageUrl } from 'next-cloudinary';
import styles from '@/styles/Image.module.scss';
import Cloudinary from '../../public/images/cloudinary.svg'
import Xata from '../../public/images/xata.svg'
import ScrappingBee from '../../public/images/scrappingbee.svg'
import Nextjs from '../../public/images/nextjs.svg'
import Vercel from '../../public/images/vercel.svg'
import Header from '@/components/Header/Header';
import {MagnifyingGlass} from 'react-loader-spinner';

import Image from 'next/image';
const swd = new co2({model: 'swd'})
const images = [Cloudinary, Xata, ScrappingBee, Nextjs, Vercel]
export default function Home() {
  const [siteUrl, setSiteUrl] = useState();
  const [siteImages, setSiteImages] = useState()
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false)

  function handleOnChange() {
    setSiteUrl();
    setError();
  }
  async function handleOnSubmit(e) {

    e.preventDefault();
    
   
    const fields = Array.from(e.currentTarget.elements);
    let url = fields.find(el => el.name === 'url')?.value;

    if ( !url ) {
      setError('Please set a valid URL.');
      return;
    }

    if ( !/^http(s)?:\/\//.test(url) ) {
      url = `https://${url}`;
    }

    setSiteUrl(url);
    setIsLoading(true)
  }


  useEffect(() => {
    if ( !siteUrl ) return;

    (
      async function run (){
        
        
        const cache = await fetch(`/api/get-site?url=${siteUrl}`)
        .then(r => r.json())
        if(cache?.site && cache?.images){
          setSiteImages(cache.images);
          setIsLoading(false)
          return;
        }
        const {images: websiteImages}  = await 
        fetch(`api/scrape?url=${siteUrl}`).then(r => r.json())

        console.log(websiteImages, 'scrape Images')
        
        const {data: uploads} = await fetch('/api/upload', {
          method: 'POST',
          body: JSON.stringify({
            images: websiteImages
          })
        }).then(r => r.json()) 
        
        const images = await Promise.all(uploads.map(async (image, i) => {
          const optimizedUrl = getCldImageUrl({
            src: image.public_id,
            format: 'avif'
          })
          const optimizedSize = (await fetch(optimizedUrl).then(r => r.blob())).size;
          console.log(optimizedSize)
          return {
            width: image.width,
            height: image.height,
            original:{
              url: websiteImages[i].src,
              size: image.bytes,
              format: image.format,
              co2: swd.perVisit(image.bytes)
            },
            upload: {
              url: image.secure_url,
              publicId: image.public_id,
            }, 
            optimized: {
            url: optimizedUrl,
            format: 'avif',
            size: optimizedSize,
            co2: swd.perVisit(optimizedSize)
            }
          }
        }))
        setSiteImages(images)

        await fetch('/api/add-site', {
          method: 'POST',
          body: JSON.stringify({
            images,
            siteUrl,
            dateCollected: new Date(Date.now()).toISOString()
          })
        })

        setIsLoading(false)

        })();
  }, [siteUrl]);

  

  return (
    <main className ={styles.main} >
      <Header/>
      <Section className ={styles.layout} >
        <Container className={styles.homeContainer}>
        <h1>What&apos;s the <span>carbon</span> footprint of the <span>images</span> on your website?</h1>
          <h2>Enter your website address and we&apos;ll calculate how much carbon that page is emitting from images.</h2>
          <form className={styles.form} onSubmit={handleOnSubmit}>
            <input className={styles.input} type="text" name="url" placeholder='mywebsite.com' onChange={handleOnChange} />
            <Button className={styles.button}>Calculate Emissions</Button>
          </form>
          {siteUrl && <p className={styles.p}>Testing { siteUrl }</p>}
          {!siteUrl && !error && <p className={styles.p1}> Note: Images may appear cropped and optimized for display purposes only.
             Results are based on original full-sized images that are embedded in the page.</p>}
          {error && <p className={styles.error}>{ error }</p>}
        </Container>
      </Section>
      <Section className ={styles.layout}>
        {isLoading ?
        
        (
          <div className={styles.loader} >
        <MagnifyingGlass
  visible={true}
  height="80"
  width="80"
  ariaLabel="MagnifyingGlass-loading"
  wrapperStyle={{}}
  wrapperClass={styles.MagnifyingGlass}
  glassColor = '#c0efff'
  color = '#e15b64'
/>
</div>
        ): 
          <Container>
          <ul className={styles.images}>
            {siteImages?.map((image, key)=>{
              return (
                <li key={key} className={styles.imagesRow}>
                <div className={styles.imageOriginal}>
                  <CldImage width={250} height={250} src={image.upload.url} alt="Original" />
                  <h3>Original</h3>
                  <ul>
                    <li>Format: {image.original.format}</li>
                    <li>Size: {(image.original.size / 1000).toFixed(2)}kb</li>
                    <li>co2: {(image.original.co2 * 1000).toFixed(2)}g</li>
                  </ul>
                </div>
                <div className={styles.imageOptimized}>
                  <CldImage width={250} height={250} src={image.upload.url} alt="Optimized" />
                  <h3>Optimized</h3>
                  <ul>
                    <li>Format: {image.optimized.format}</li>
                    <li>Size: {(image.optimized.size / 1000).toFixed(2)}kb</li>
                    <li>co2: {(image.optimized.co2 * 1000).toFixed(2)}g</li>
                  </ul>
                </div>
              </li>
              )
              })}
          
          </ul>
        </Container>
}
        <Container className={styles.imgContainer}>
          <h1>Built by Anas Khan with</h1>
          <div className={styles.techImages}>
          {images.map((image, key) => {
            return (
              <Image className='image' key={key} src={image} alt={key}/>
            )
          })}
          </div>
          <p>This site does not collect or store any personal information.</p>
        </Container>
      </Section>
    </main>
  )
}