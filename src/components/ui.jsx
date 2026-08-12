import { cloneElement, forwardRef, useId } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { MoreHorizontal, X } from 'lucide-react'
import { cn } from '../lib'
import { BUSINESS_CATEGORIES } from '../businessCategories'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50', { variants: { variant: { default: 'bg-primary text-primary-foreground hover:bg-orange-600', outline: 'border border-border bg-background hover:bg-muted', ghost: 'hover:bg-muted', danger: 'bg-red-600 text-white hover:bg-red-700' }, size: { default: 'h-11 px-5', sm: 'h-9 px-3', icon: 'h-10 w-10' } }, defaultVariants: { variant: 'default', size: 'default' } })
export const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : 'button'; return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} /> })
Button.displayName = 'Button'
export const Input = forwardRef(({ className, ...props }, ref) => {
  const fieldProps = props.name === 'physicalAddress' ? { ...props, required: false } : props
  if (props.name === 'businessType') return <select ref={ref} className={cn('flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary', className)} {...fieldProps}><option value="">Select business sector</option>{BUSINESS_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select>
  return <input ref={ref} className={cn('flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary', className)} {...fieldProps} />
}); Input.displayName = 'Input'
export const Textarea = forwardRef(({ className, ...props }, ref) => <textarea ref={ref} className={cn('min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary', className)} {...(props.name === 'physicalAddress' ? { ...props, required: false } : props)} />); Textarea.displayName = 'Textarea'
export const Label = props => <label className="mb-1.5 block text-sm font-medium" {...props} />
export const Card = ({ className, ...props }) => <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)} {...props} />
export const Skeleton = ({ className, ...props }) => <div aria-hidden="true" className={cn('skeleton', className)} {...props}/>
export const TableSkeleton = ({ rows = 6, columns = 5 }) => <div className="skeleton-table" role="status" aria-label="Loading table"><div className="skeleton-table-head">{Array.from({ length: columns }, (_, index) => <Skeleton key={index}/>)}</div>{Array.from({ length: rows }, (_, row) => <div className="skeleton-table-row" key={row}>{Array.from({ length: columns }, (_, column) => <div key={column}><Skeleton/><Skeleton className="short"/></div>)}</div>)}<span className="sr-only">Loading…</span></div>
export const ChartSkeleton = ({ height = 280 }) => <div className="skeleton-chart" style={{ minHeight: height }} role="status" aria-label="Loading chart"><div className="skeleton-chart-bars">{[42,68,51,84,61,73,47,78].map((heightValue, index) => <Skeleton key={index} style={{ height: `${heightValue}%` }}/>)}</div><span className="sr-only">Loading…</span></div>
export const PageSkeleton = () => <div className="skeleton-page" role="status" aria-label="Loading page"><div className="skeleton-heading"><div><Skeleton/><Skeleton className="short"/></div><Skeleton className="skeleton-button"/></div><div className="skeleton-stat-grid">{Array.from({ length: 4 }, (_, index) => <Card key={index} className="skeleton-stat"><Skeleton className="skeleton-icon"/><div><Skeleton/><Skeleton className="short"/></div></Card>)}</div><Card className="skeleton-panel"><Skeleton className="skeleton-panel-title"/><TableSkeleton rows={5}/></Card><span className="sr-only">Loading…</span></div>
export const Field = ({ label, error, hint, children }) => {
  const generatedId = useId()
  const id = children?.props?.id || `field-${generatedId.replaceAll(':', '')}`
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [children?.props?.['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined
  return <div className="field"><Label htmlFor={id}>{children?.props?.name === 'physicalAddress' ? 'Physical address (optional)' : label}</Label>{cloneElement(children, { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}{hint && <p id={hintId} className="field-hint">{hint}</p>}{error && <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}</div>
}
export const Dialog = DialogPrimitive.Root; export const DialogTrigger = DialogPrimitive.Trigger; export const DialogClose = DialogPrimitive.Close
export const DialogContent = ({ children, className }) => <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60"/><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(94vw,620px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border bg-background p-6 shadow-xl', className)}>{children}<DialogPrimitive.Close className="absolute right-4 top-4"><X size={18}/><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>
export const DialogTitle = props => <DialogPrimitive.Title className="text-xl font-bold" {...props}/>
export const Badge = ({ children, tone = 'orange' }) => <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', tone === 'green' ? 'bg-green-100 text-green-800' : tone === 'red' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800')}>{children}</span>
export const Alert = ({ children, type = 'error' }) => <div role="alert" className={cn('rounded-md border px-4 py-3 text-sm', type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700')}>{children}</div>

export const TableActions = ({ children, label = 'Open actions' }) => <DropdownMenuPrimitive.Root><DropdownMenuPrimitive.Trigger asChild><Button type="button" size="icon" variant="ghost" className="table-actions-trigger" aria-label={label}><MoreHorizontal size={20}/></Button></DropdownMenuPrimitive.Trigger><DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content className="table-actions-menu" sideOffset={5} align="end">{children}</DropdownMenuPrimitive.Content></DropdownMenuPrimitive.Portal></DropdownMenuPrimitive.Root>
export const TableAction = forwardRef(({ className, danger = false, children, ...props }, ref) => <DropdownMenuPrimitive.Item ref={ref} className={cn('table-action-item', danger && 'danger', className)} {...props}>{children}</DropdownMenuPrimitive.Item>)
TableAction.displayName = 'TableAction'
