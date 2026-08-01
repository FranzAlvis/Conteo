import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Camera, Upload, Trash2, CheckCircle2, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { auth } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentUser = auth.user || {
    name: 'Yamile Hayes Michel',
    username: 'admin',
    role: 'ADMIN',
    avatar: '',
  }

  const [name, setName] = useState(currentUser.name || '')
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser.avatar || '')
  const [isLoading, setIsLoading] = useState(false)

  const roleName = Array.isArray(currentUser.role)
    ? currentUser.role[0]
    : typeof currentUser.role === 'string'
      ? currentUser.role
      : 'VISOR'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor seleccione un archivo de imagen válido')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 4MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setAvatarPreview(base64String)
      toast.info('Foto de perfil seleccionada correctamente')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      auth.setUser({
        ...(auth.user || {}),
        name,
        avatar: avatarPreview,
      })
      setIsLoading(false)
      toast.success('Perfil actualizado correctamente')
      onOpenChange(false)
    }, 600)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-lg font-bold flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            Mi Perfil de Usuario
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Actualice su foto de perfil y sus datos personales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6 py-2'>
          {/* Avatar Upload Section */}
          <div className='flex flex-col items-center justify-center space-y-3 p-4 bg-muted/30 rounded-2xl border border-dashed border-border/80'>
            <div className='relative group'>
              <Avatar className='h-24 w-24 border-4 border-primary/20 shadow-xl'>
                <AvatarImage src={avatarPreview || currentUser.avatar || '/avatars/01.png'} alt={name} />
                <AvatarFallback className='bg-primary text-primary-foreground font-black text-2xl'>
                  {name ? name.slice(0, 2).toUpperCase() : 'YH'}
                </AvatarFallback>
              </Avatar>

              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs'
              >
                <Camera className='h-7 w-7' />
              </button>
            </div>

            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept='image/*'
              className='hidden'
            />

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                className='text-xs font-semibold gap-1.5'
              >
                <Upload className='h-3.5 w-3.5 text-primary' /> Cambiar Foto
              </Button>

              {avatarPreview && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleRemoveAvatar}
                  className='text-xs text-destructive hover:text-destructive gap-1'
                >
                  <Trash2 className='h-3.5 w-3.5' /> Eliminar
                </Button>
              )}
            </div>

            {avatarPreview && (
              <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300/40'>
                <CheckCircle2 className='h-3 w-3' /> Foto de perfil seleccionada
              </span>
            )}
          </div>

          {/* User Fields */}
          <div className='space-y-4'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Nombre Completo</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Nombre de usuario'
                className='text-xs font-medium'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Nombre de Usuario</Label>
                <Input
                  value={currentUser.username || 'admin'}
                  disabled
                  className='text-xs bg-muted/50 font-mono'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Rol de Sistema</Label>
                <div className='h-9 flex items-center px-3 rounded-md border bg-muted/50'>
                  <Badge variant='outline' className='text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border-primary/30'>
                    {roleName}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='text-xs'
            >
              Cancelar
            </Button>
            <Button type='submit' className='text-xs font-bold' disabled={isLoading}>
              {isLoading && <Loader2 className='h-4 w-4 animate-spin mr-1' />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
