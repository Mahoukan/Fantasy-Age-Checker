import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  DEFAULT_RESULT_IMAGE_THEME_ID,
  getResultImageTheme,
  resultImageThemes,
  type ResultImageThemeId,
} from '../data/resultImageThemes'
import {
  createResultPng,
  downloadResultPng,
  shareResultPng,
  supportsImageFileSharing,
} from '../utils/resultImage'
import {
  copyText,
  createShareParams,
  createShareResultText,
  createShareUrl,
  hasNativeShare,
  shareNatively,
  type NativeShareFunction,
  type ShareResultModel,
} from '../utils/share'

interface ShareControlsProps {
  result: ShareResultModel & { caseNumber: string }
}

const FEEDBACK_DURATION_MS = 2600

export function ShareControls({ result }: ShareControlsProps) {
  const [feedback, setFeedback] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState<ResultImageThemeId>(DEFAULT_RESULT_IMAGE_THEME_ID)
  const [nativeShareAvailable] = useState(() => (
    typeof navigator !== 'undefined' && hasNativeShare(navigator.share?.bind(navigator))
  ))
  const [imageShareAvailable] = useState(() => (
    typeof navigator !== 'undefined' && supportsImageFileSharing(navigator)
  ))
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const summary = useMemo(() => createShareResultText(result), [result])
  const permalinkEligible = useMemo(
    () => createShareParams(result.applicants) !== undefined,
    [result.applicants],
  )
  const permalink = useMemo(() => (
    typeof window === 'undefined'
      ? undefined
      : createShareUrl(result.applicants, {
        origin: window.location.origin,
        pathname: window.location.pathname,
      })
  ), [result.applicants])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  function announce(message: string, clearAutomatically = true) {
    if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current)
    setFeedback(message)
    feedbackTimerRef.current = null
    if (clearAutomatically) {
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback('')
        feedbackTimerRef.current = null
      }, FEEDBACK_DURATION_MS)
    }
  }

  async function handleCopyResult() {
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    announce(await copyText(summary, clipboard) ? 'Result copied.' : 'The result could not be copied.')
  }

  async function handleCopyLink() {
    if (!permalink) return
    const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    announce(await copyText(permalink, clipboard) ? 'Share link copied.' : 'The share link could not be copied.')
  }

  async function handleNativeShare() {
    const share = typeof navigator === 'undefined' || !navigator.share
      ? undefined
      : ((payload) => navigator.share(payload)) as NativeShareFunction
    const outcome = await shareNatively({
      title: 'Fantasy Age Checker - Bureau Assessment',
      text: summary,
      ...(permalink ? { url: permalink } : {}),
    }, share)

    if (outcome === 'shared') announce('Ruling shared.')
    if (outcome === 'cancelled') announce('Sharing cancelled.')
    if (outcome === 'failed') announce('Sharing was not completed.')
  }

  async function handleSaveImage() {
    if (isGeneratingImage) return
    setIsGeneratingImage(true)
    announce('Preparing result image…', false)
    try {
      const png = await createResultPng(result, undefined, undefined, selectedThemeId)
      downloadResultPng(png, result.caseNumber)
      announce('Result image saved.')
    } catch {
      announce('The result image could not be created. Your ruling is unchanged.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  async function handleShareImage() {
    if (isGeneratingImage) return
    setIsGeneratingImage(true)
    announce('Preparing result image…', false)
    try {
      const png = await createResultPng(result, undefined, undefined, selectedThemeId)
      const outcome = await shareResultPng(png, result.caseNumber, navigator)
      if (outcome === 'shared') announce('Result image shared.')
      if (outcome === 'cancelled') announce('Image sharing cancelled.')
      if (outcome === 'failed') announce('The result image could not be shared. Your ruling is unchanged.')
      if (outcome === 'unsupported') announce('Image sharing is not supported by this browser.')
    } catch {
      announce('The result image could not be created. Your ruling is unchanged.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <aside className="share-ruling" aria-labelledby="share-ruling-title">
      <div>
        <span className="share-ruling-label">Ruling services</span>
        <h3 id="share-ruling-title">Share This Ruling</h3>
      </div>
      <fieldset className="result-theme-picker" disabled={isGeneratingImage} aria-describedby="result-theme-help">
        <legend>Result Card Style</legend>
        <p id="result-theme-help">
          Choose the presentation used when saving or sharing an image. Ruling content stays unchanged.
        </p>
        <div className="result-theme-options">
          {resultImageThemes.map((theme) => {
            const checked = selectedThemeId === theme.id
            const swatchStyle = {
              '--theme-swatch-background': theme.palette.background,
              '--theme-swatch-paper': theme.palette.paper,
              '--theme-swatch-accent': theme.palette.accent,
            } as CSSProperties
            return (
              <label className={`result-theme-option${checked ? ' selected' : ''}`} key={theme.id}>
                <input
                  type="radio"
                  name={`result-card-theme-${result.caseNumber}`}
                  value={theme.id}
                  checked={checked}
                  onChange={() => setSelectedThemeId(theme.id)}
                />
                <span className="result-theme-swatch" style={swatchStyle} aria-hidden="true">
                  <i />
                </span>
                <span>
                  <strong>{theme.name}</strong>
                  <small>{theme.description}</small>
                </span>
              </label>
            )
          })}
        </div>
        <p className="selected-theme-status" aria-live="polite">
          Selected: {getResultImageTheme(selectedThemeId).name}
        </p>
      </fieldset>
      <div className="share-action-groups">
        <div className="share-action-group">
          <span>Text &amp; link</span>
          <div className="share-actions">
            <button type="button" onClick={handleCopyResult}>Copy Result</button>
            <button
              type="button"
              disabled={!permalinkEligible}
              aria-describedby={!permalinkEligible ? 'custom-share-link-note' : undefined}
              onClick={handleCopyLink}
            >
              Copy Link
            </button>
            {nativeShareAvailable && <button type="button" onClick={handleNativeShare}>Share Result</button>}
          </div>
        </div>
        <div className="share-action-group" aria-busy={isGeneratingImage}>
          <span>Image</span>
          <div className="share-actions">
            <button type="button" disabled={isGeneratingImage} onClick={handleSaveImage}>
              {isGeneratingImage ? 'Preparing Image…' : 'Save Image'}
            </button>
            {imageShareAvailable && (
              <button type="button" disabled={isGeneratingImage} onClick={handleShareImage}>Share Image</button>
            )}
          </div>
        </div>
      </div>
      {!permalinkEligible && (
        <p className="share-limitation" id="custom-share-link-note">
          Temporary species cannot be included in permanent share links. Result text can still be copied or shared.
        </p>
      )}
      <p className="share-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback}</p>
    </aside>
  )
}
