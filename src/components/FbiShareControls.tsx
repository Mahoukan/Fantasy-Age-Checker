import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { DEFAULT_RESULT_CARD_FORMAT_ID, getResultCardFormat, resultCardFormats, type ResultCardFormatId } from '../data/resultCardFormats'
import { DEFAULT_RESULT_IMAGE_THEME_ID, getResultImageTheme, resultImageThemes, type ResultImageThemeId } from '../data/resultImageThemes'
import type { FbiApplicantRecord } from '../types/fbiApplicant'
import type { FbiSubmittedReview } from '../types/fbiPresentation'
import { createFbiResultPng } from '../utils/fbiResultImage'
import { createFbiResultText, createFbiShareParams, createFbiShareUrl, type FbiDraftPair } from '../utils/fbiShare'
import { downloadResultPng, shareResultPng, supportsImageFileSharing } from '../utils/resultImage'
import { copyText, hasNativeShare, shareNatively, type NativeShareFunction } from '../utils/share'

type ApprovedReview = Extract<FbiSubmittedReview, { presentation: object }>

interface FbiShareControlsProps {
  review: ApprovedReview
  records: readonly [FbiApplicantRecord, FbiApplicantRecord]
  drafts: FbiDraftPair
  initialThemeId?: ResultImageThemeId
}

const FEEDBACK_DURATION_MS = 2600

export function FbiShareControls({ review, records, drafts, initialThemeId = DEFAULT_RESULT_IMAGE_THEME_ID }: FbiShareControlsProps) {
  const [feedback, setFeedback] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState<ResultImageThemeId>(initialThemeId)
  const [selectedFormatId, setSelectedFormatId] = useState<ResultCardFormatId>(DEFAULT_RESULT_CARD_FORMAT_ID)
  const [nativeShareAvailable] = useState(() => typeof navigator !== 'undefined' && hasNativeShare(navigator.share?.bind(navigator)))
  const [imageShareAvailable] = useState(() => typeof navigator !== 'undefined' && supportsImageFileSharing(navigator))
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const summary = useMemo(() => createFbiResultText(review, records), [review, records])
  const permalinkEligible = useMemo(() => createFbiShareParams(drafts) !== undefined, [drafts])
  const permalink = useMemo(() => typeof window === 'undefined' ? undefined : createFbiShareUrl(drafts, { origin: window.location.origin, pathname: window.location.pathname }), [drafts])

  useEffect(() => () => { if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current) }, [])

  function announce(message: string, clearAutomatically = true) {
    if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current)
    setFeedback(message)
    feedbackTimerRef.current = clearAutomatically ? setTimeout(() => { setFeedback(''); feedbackTimerRef.current = null }, FEEDBACK_DURATION_MS) : null
  }

  async function handleCopyResult() {
    announce(await copyText(summary, typeof navigator === 'undefined' ? undefined : navigator.clipboard) ? 'FBI result copied.' : 'The FBI result could not be copied.')
  }

  async function handleCopyLink() {
    if (!permalink) return
    announce(await copyText(permalink, typeof navigator === 'undefined' ? undefined : navigator.clipboard) ? 'FBI link copied.' : 'The FBI link could not be copied.')
  }

  async function handleNativeShare() {
    const share = typeof navigator === 'undefined' || !navigator.share ? undefined : ((payload) => navigator.share(payload)) as NativeShareFunction
    const outcome = await shareNatively({ title: 'Fantasy Bureau of Immortality Review', text: summary, ...(permalink ? { url: permalink } : {}) }, share)
    if (outcome === 'shared') announce('FBI result shared.')
    if (outcome === 'cancelled') announce('Sharing cancelled.')
    if (outcome === 'failed') announce('Sharing was not completed.')
  }

  async function createImage(): Promise<Blob> {
    return createFbiResultPng(review, records, selectedThemeId, selectedFormatId)
  }

  async function handleSaveImage() {
    if (isGeneratingImage) return
    setIsGeneratingImage(true); announce('Preparing FBI result image…', false)
    try {
      downloadResultPng(await createImage(), review.presentation.caseNumber)
      announce('FBI result image saved.')
    } catch { announce('The FBI result image could not be created. The dossier is unchanged.') }
    finally { setIsGeneratingImage(false) }
  }

  async function handleShareImage() {
    if (isGeneratingImage) return
    setIsGeneratingImage(true); announce('Preparing FBI result image…', false)
    try {
      const outcome = await shareResultPng(await createImage(), review.presentation.caseNumber, navigator)
      if (outcome === 'shared') announce('FBI result image shared.')
      if (outcome === 'cancelled') announce('Image sharing cancelled.')
      if (outcome === 'failed') announce('The FBI result image could not be shared.')
      if (outcome === 'unsupported') announce('Image sharing is not supported by this browser.')
    } catch { announce('The FBI result image could not be created. The dossier is unchanged.') }
    finally { setIsGeneratingImage(false) }
  }

  return <aside className="share-ruling fbi-share-controls" aria-labelledby="fbi-share-title">
    <div><span className="share-ruling-label">FBI dossier services</span><h3 id="fbi-share-title">Share This Review</h3></div>
    <fieldset className="result-format-picker" disabled={isGeneratingImage}><legend>Result Card Format</legend>
      <p>Choose the detail included in the FBI image.</p><div className="result-format-options">{resultCardFormats.map((format) => <label className={`result-format-option${selectedFormatId === format.id ? ' selected' : ''}`} key={format.id}>
        <input type="radio" name={`fbi-card-format-${review.presentation.caseNumber}`} value={format.id} checked={selectedFormatId === format.id} onChange={() => setSelectedFormatId(format.id)} />
        <span><strong>{format.name}</strong><small>{format.description}</small></span><em aria-hidden="true">{format.width} × {format.height}</em>
      </label>)}</div><p className="selected-format-status" aria-live="polite">Selected format: {getResultCardFormat(selectedFormatId).name}</p>
    </fieldset>
    <fieldset className="result-theme-picker" disabled={isGeneratingImage}><legend>Result Card Theme</legend>
      <p>Theme changes presentation only; the stored FBI dossier remains unchanged.</p><div className="result-theme-options">{resultImageThemes.map((theme) => {
        const swatchStyle = { '--theme-swatch-background': theme.palette.background, '--theme-swatch-paper': theme.palette.paper, '--theme-swatch-accent': theme.palette.accent } as CSSProperties
        return <label className={`result-theme-option${selectedThemeId === theme.id ? ' selected' : ''}`} key={theme.id}>
          <input type="radio" name={`fbi-card-theme-${review.presentation.caseNumber}`} value={theme.id} checked={selectedThemeId === theme.id} onChange={() => setSelectedThemeId(theme.id)} />
          <span className="result-theme-swatch" style={swatchStyle} aria-hidden="true"><i /></span><span><strong>{theme.name}</strong><small>{theme.description}</small></span>
        </label>
      })}</div><p className="selected-theme-status" aria-live="polite">Selected: {getResultImageTheme(selectedThemeId).name}</p>
    </fieldset>
    <div className="share-action-groups">
      <div className="share-action-group"><span>Text &amp; link</span><div className="share-actions">
        <button type="button" onClick={handleCopyResult}>Copy FBI Result</button>
        <button type="button" disabled={!permalinkEligible} aria-describedby={!permalinkEligible ? 'fbi-link-limitation' : undefined} onClick={handleCopyLink}>Copy FBI Link</button>
        {nativeShareAvailable && <button type="button" onClick={handleNativeShare}>Share FBI Result</button>}
      </div></div>
      <div className="share-action-group" aria-busy={isGeneratingImage}><span>Image</span><div className="share-actions">
        <button type="button" disabled={isGeneratingImage} onClick={handleSaveImage}>{isGeneratingImage ? 'Preparing Image…' : 'Save Image'}</button>
        {imageShareAvailable && <button type="button" disabled={isGeneratingImage} onClick={handleShareImage}>Share Image</button>}
      </div></div>
    </div>
    {!permalinkEligible && <p className="share-limitation" id="fbi-link-limitation">Permanent FBI links support built-in presets and built-in species only. Result text and images remain available.</p>}
    <p className="share-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
  </aside>
}
