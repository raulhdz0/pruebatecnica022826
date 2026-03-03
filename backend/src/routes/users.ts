import { Router, Request, Response, NextFunction } from 'express'
import { User, Wallet } from '../models/index'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      include: [{ model: Wallet }]
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, balance } = req.body

    if (!name || !email) {
      res.status(400).json({ message: 'Nombre y email son requeridos.' })
      return
    }

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está registrado.' })
      return
    }

    const user = await User.create({ name, email })
    const wallet = await Wallet.create({
      user_id: user.id,
      balance: balance || 0.00
    })

    res.status(201).json({ user, wallet })
  } catch (err) {
    next(err)
  }
})

export default router
