import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // apiVersion: '2024-12-18.acacia', // Removed to use default from package
});

export async function POST(req: Request) {
    try {
        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    // OR define price data inline (as done here for simplicity/demo)
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'LifeOS Pro - EARLY BIRD SPECIAL',
                            description: 'Unlock premium features including unlimited AI extractions and cloud sync.',
                        },
                        unit_amount: 100, // $1.00
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/lifesync?success=true`,
            cancel_url: `${req.headers.get('origin')}/lifesync?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json(
            { error: err.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
