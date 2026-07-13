import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

// Example component showing how to use shadcn/ui components
const ExampleUsage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Basic Card Example */}
      <Card>
        <CardHeader>
          <CardTitle>Auction Item</CardTitle>
          <CardDescription>Vintage Rolex Submariner - Rare 1960s Model</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a pristine example of the iconic Rolex Submariner from the 1960s. 
            Features original dial, hands, and bezel insert. Comes with original box and papers.
          </p>
          <div className="mt-4">
            <Label htmlFor="bid-amount">Your Bid Amount</Label>
            <Input 
              id="bid-amount" 
              type="number" 
              placeholder="Enter your bid"
              className="mt-2"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Current Bid: $15,000
          </div>
          <Button>Place Bid</Button>
        </CardFooter>
      </Card>

      {/* Card with Image Example */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-lg font-medium">Auction Image</span>
        </div>
        <CardHeader>
          <CardTitle>Artwork Collection</CardTitle>
          <CardDescription>Contemporary Abstract Painting</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stunning abstract artwork by renowned artist. Oil on canvas, 48" x 36".
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View Details</Button>
        </CardFooter>
      </Card>

      {/* Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Auction</CardTitle>
          <CardDescription>Add a new item to your auction catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input id="item-name" placeholder="Enter item name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Enter item description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starting-price">Starting Price</Label>
            <Input id="starting-price" type="number" placeholder="Enter starting price" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Create Auction</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ExampleUsage; 