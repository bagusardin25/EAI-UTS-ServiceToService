const Loader = ({ size = 'md', text = '', fullPage = false }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div className={`${sizes[size]} border-stone-200 border-t-stone-700 rounded-full animate-spin`} />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
        {text && <p className="font-body text-sm text-stone-500 tracking-wide">{text}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      {spinner}
      {text && <p className="font-body text-sm text-stone-500 tracking-wide">{text}</p>}
    </div>
  )
}

export default Loader
