import { NextResponse } from 'next/server';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { getDocs, collection, db, query, where } from '../../../lib/firebase';

// Initialize Google Vision client using dedicated service account
let visionClient;
let initializationError = null;

try {
  // Get Google Vision service account from environment
  const visionCredentials = process.env.GOOGLE_VISION_SERVICE_ACCOUNT;
  
  console.log('GOOGLE_VISION_SERVICE_ACCOUNT exists:', !!visionCredentials);
  console.log('First 100 chars:', visionCredentials?.substring(0, 100));
  
  if (!visionCredentials) {
    throw new Error('GOOGLE_VISION_SERVICE_ACCOUNT environment variable is not set');
  }

  // Parse the JSON credentials
  const credentials = JSON.parse(visionCredentials);
  
  console.log('Parsed credentials - project_id:', credentials.project_id);
  console.log('Parsed credentials - client_email:', credentials.client_email);
  
  // Initialize Vision API client with dedicated service account
  visionClient = new ImageAnnotatorClient({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
  });
  
  console.log('Google Vision API client initialized successfully with project:', credentials.project_id);
} catch (error) {
  console.error('Failed to initialize Google Vision client:', error);
  initializationError = error.message;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test');
  
  if (test === 'vision') {
    // Test Vision API with a simple online image
    try {
      if (!visionClient) {
        return NextResponse.json({ success: false, error: 'Vision client not initialized' });
      }
      
      // Test with a simple image URL
      const testImageUrl = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'; // Denim jacket
      
      const [result] = await visionClient.labelDetection({
        image: { source: { imageUri: testImageUrl } },
      });
      
      const labels = result.labelAnnotations || [];
      
      return NextResponse.json({
        success: true,
        testResult: {
          labels: labels.map(l => ({ description: l.description, score: l.score })),
          message: 'Vision API test completed'
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        testResult: 'Vision API test failed'
      });
    }
  }
  
  return NextResponse.json({
    success: true,
    status: {
      visionClientInitialized: !!visionClient,
      initializationError: initializationError,
      envVarExists: !!process.env.GOOGLE_VISION_SERVICE_ACCOUNT,
      envVarLength: process.env.GOOGLE_VISION_SERVICE_ACCOUNT?.length || 0
    }
  });
}

export async function POST(request) {
  try {
    if (!visionClient) {
      return NextResponse.json(
        { success: false, error: 'Google Vision API not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert the image to buffer
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    
    console.log('Image details:', {
      name: image.name,
      size: image.size,
      type: image.type,
      bufferLength: imageBuffer.length
    });
    
    // Validate image buffer
    if (imageBuffer.length === 0) {
      console.error('Image buffer is empty!');
      return NextResponse.json(
        { success: false, error: 'Image buffer is empty' },
        { status: 400 }
      );
    }
    
    // Check if it's a valid image by looking at the first few bytes
    const header = imageBuffer.subarray(0, 4);
    console.log('Image header bytes:', Array.from(header).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    
    // JPEG should start with FF D8 FF
    // PNG should start with 89 50 4E 47
    const isJPEG = header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF;
    const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
    
    console.log('Image format validation:', { isJPEG, isPNG });
    
    if (!isJPEG && !isPNG) {
      console.error('Invalid image format detected!');
      return NextResponse.json(
        { success: false, error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Call Google Vision API for label detection
    console.log('Calling Google Vision API with uploaded image...');
    const [labelResult] = await visionClient.labelDetection({
      image: { content: imageBuffer },
    });
    
    console.log('Raw Label Detection response:', labelResult);

    const labels = labelResult.labelAnnotations || [];
    
    // If no labels found, try object detection as backup
    let objects = [];
    if (labels.length === 0) {
      console.log('No labels found, trying object detection...');
      try {
        const [objectResult] = await visionClient.objectLocalization({
          image: { content: imageBuffer },
        });
        
        console.log('Raw Object Detection response:', objectResult);
        objects = objectResult.localizedObjectAnnotations || [];
        console.log('Objects detected:', objects.map(obj => ({
          name: obj.name,
          score: obj.score
        })));
      } catch (objectError) {
        console.error('Object detection failed:', objectError);
      }
    }
    
    console.log('=== DETAILED LABEL ANALYSIS ===');
    console.log('Total labels returned by Google Vision:', labels.length);
    console.log('All labels from Google Vision:', labels.map(l => ({ 
      description: l.description, 
      score: l.score,
      confidence: `${Math.round(l.score * 100)}%`
    })));
    
    // Show count of labels at different thresholds
    const countAt70 = labels.filter(l => l.score > 0.7).length;
    const countAt50 = labels.filter(l => l.score > 0.5).length;
    const countAt30 = labels.filter(l => l.score > 0.3).length;
    const countAt10 = labels.filter(l => l.score > 0.1).length;
    
    console.log('Label count analysis:');
    console.log(`- Labels >70% confidence: ${countAt70}`);
    console.log(`- Labels >50% confidence: ${countAt50}`);
    console.log(`- Labels >30% confidence: ${countAt30}`);
    console.log(`- Labels >10% confidence: ${countAt10}`);
    console.log('=== END ANALYSIS ===');
    
    // Extract label descriptions with lower confidence threshold
    const highConfidenceTerms = labels
      .filter(label => label.score > 0.5) // Lowered from 0.7 to 0.5
      .map(label => label.description.toLowerCase())
      .slice(0, 15); // Increased to 15 labels
    
    // Also try with very low confidence for debugging
    const allTerms = labels
      .filter(label => label.score > 0.3) // Very low threshold
      .map(label => label.description.toLowerCase())
      .slice(0, 20);
    
    console.log('High confidence labels (>0.5):', highConfidenceTerms);
    console.log('All labels (>0.3):', allTerms);
    
    // Use high confidence first, fallback to all terms
    let searchTerms = highConfidenceTerms.length > 0 ? highConfidenceTerms : allTerms;

    // If no labels found, use object detection results
    if (searchTerms.length === 0 && objects.length > 0) {
      console.log('Using object detection results as search terms...');
      const objectTerms = objects
        .filter(obj => obj.score > 0.5) // Use objects with >50% confidence
        .map(obj => obj.name.toLowerCase())
        .slice(0, 10);
      
      console.log('Object-based search terms:', objectTerms);
      searchTerms = objectTerms;
    }

    if (searchTerms.length === 0) {
      // Final fallback: try common fashion terms
      console.log('No labels or objects detected, trying fallback search with common fashion terms');
      const fallbackTerms = ['clothing', 'fashion', 'apparel', 'shirt', 'jacket', 'dress', 'pants', 'footwear'];
      const fallbackProducts = await searchProductsByLabels(fallbackTerms);
      
      return NextResponse.json({
        success: true,
        data: {
          products: fallbackProducts.slice(0, 10), // Limit fallback results
          labels: ['fallback search'],
          message: 'Used fallback search - no specific labels detected',
          totalResults: fallbackProducts.length
        }
      });
    }

    // Search for products in Firestore based on detected labels
    const products = await searchProductsByLabels(searchTerms);

    return NextResponse.json({
      success: true,
      data: {
        products,
        labels: searchTerms,
        totalResults: products.length
      }
    });

  } catch (error) {
    console.error('Error in visual search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

async function searchProductsByLabels(searchTerms) {
  try {
    const productsRef = collection(db, 'products');
    const allProducts = [];

    // Get all products first (we'll filter in memory for now)
    // In a production app, you might want to implement full-text search with Algolia or similar
    const snapshot = await getDocs(productsRef);
    
    snapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };
      allProducts.push(product);
    });

    // Score products based on how many search terms match
    const scoredProducts = allProducts.map(product => {
      let score = 0;
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...(product.tags || [])
      ].join(' ').toLowerCase();

      // Count matches for each search term
      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += 1;
        }
      });

      return { ...product, matchScore: score };
    });

    // Filter and sort by relevance
    const relevantProducts = scoredProducts
      .filter(product => product.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // Limit to top 20 results

    return relevantProducts;

  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Helper function to create a more sophisticated search
async function advancedProductSearch(searchTerms) {
  try {
    const productsRef = collection(db, 'products');
    const searchResults = new Map();

    // Search by category
    for (const term of searchTerms) {
      const categoryQuery = query(productsRef, where('category', '==', term));
      const categorySnapshot = await getDocs(categoryQuery);
      
      categorySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        const existing = searchResults.get(product.id);
        searchResults.set(product.id, {
          ...product,
          relevanceScore: (existing?.relevanceScore || 0) + 2 // Higher weight for category matches
        });
      });
    }

    // Additional searches can be added here for name, description, etc.
    // For now, we'll stick with the simpler approach above

    return Array.from(searchResults.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

  } catch (error) {
    console.error('Error in advanced search:', error);
    return [];
  }
}
