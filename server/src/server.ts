import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const SECRET_KEY = process.env.SECRET_KEY || '888';

app.use(cors());
app.use(bodyParser.json());

app.post('/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Received login request:', { email });

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found:', email);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}) as RequestHandler);

app.post('/signup', (async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    console.log('Received signup request:', { email, name, password });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    console.log('User created successfully:', user);

    res.status(201).json({ user });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}) as RequestHandler);

app.get('/users', (async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
}) as RequestHandler);

app.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        categories: true,
        ratings: true,
        activities: true,
      },
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/plans', (async (req: Request, res: Response) => {
  const { title, description, cost, createdById, image } = req.body;
  const plan = await prisma.plan.create({
    data: {
      title,
      description,
      cost,
      createdById,
      image,
    },
  });
  res.status(201).json(plan);
}) as RequestHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});