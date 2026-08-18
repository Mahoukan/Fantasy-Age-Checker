import { afterEach, describe, expect, it, vi } from 'vitest'
import { species, type CustomSpecies, type Species } from '../data/species'
import type { ApplicantLabel, ApplicantLifecycleFacts } from '../types/applicant'
import {
  CONSULTATION_DELAY_MS,
  createApprovedConsultation,
  createConsultationScheduler,
} from './consultation'
import { calculateAdultExperience, calculateRelativeAge } from './lifecycle'
import type { StorageLike } from './quipSelector'

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

function facts(label: ApplicantLabel, selectedSpecies: Species, age: number): ApplicantLifecycleFacts {
  return {
    label,
    species: selectedSpecies,
    age,
    adultExperience: calculateAdultExperience(selectedSpecies, age),
    relativeAge: calculateRelativeAge(selectedSpecies, age),
  }
}

afterEach(() => vi.useRealTimers())

describe('approved consultation records', () => {
  const human = species.find((entry) => entry.id === 'human')!
  const elf = species.find((entry) => entry.id === 'elf')!

  it('captures the canonical Elf 300 / Human 34 outcome and case structure', () => {
    const record = createApprovedConsultation(
      [facts('A', elf, 300), facts('B', human, 34)],
      { random: () => 0, caseRandom: () => 0.654321, storage: new MemoryStorage() },
    )
    expect(record.maturity.category).toBe('EXCELLENT')
    expect(record.experience.category).toBe('HISTORICAL')
    expect(record.caseNumber).toBe('ARB-ELF-HUM-654321')
    expect(record.loadingMessage.slot).toBe('LOADING')
  })

  it('keeps Human 30 / Human 28 in Excellent and Basically Peers', () => {
    const record = createApprovedConsultation(
      [facts('A', human, 30), facts('B', human, 28)],
      { random: () => 0, caseRandom: () => 0, storage: new MemoryStorage() },
    )
    expect(record.maturity.category).toBe('EXCELLENT')
    expect(record.experience.category).toBe('BASICALLY_PEERS')
    expect(record.caseNumber).toMatch(/^ARB-HUM-HUM-/)
  })

  it('keeps a custom display species while using CUS and generic quips', () => {
    const highElf: CustomSpecies = {
      id: 'custom-1',
      name: 'High Elf',
      adulthoodAge: 100,
      typicalLifespan: 1000,
      source: 'custom',
    }
    const record = createApprovedConsultation(
      [facts('A', highElf, 400), facts('B', human, 34)],
      { random: () => 0, caseRandom: () => 0.5, storage: new MemoryStorage() },
    )
    expect(record.applicants[0].species.name).toBe('High Elf')
    expect(record.caseNumber).toBe('ARB-CUS-HUM-500000')
    expect(record.maturity.category).toBe('EXCELLENT')
    expect(record.experience.category).toBe('HISTORICAL')
    expect(Object.values(record.quips).every((quip) => !quip.species?.includes('elf'))).toBe(true)
  })

  it('rotates selected copy while leaving calculations unchanged', () => {
    const storage = new MemoryStorage()
    const applicants = [facts('A', elf, 300), facts('B', human, 34)] as const
    const first = createApprovedConsultation(applicants, {
      random: () => 0,
      caseRandom: () => 0.1,
      storage,
    })
    const second = createApprovedConsultation(applicants, {
      random: () => 0,
      caseRandom: () => 0.2,
      storage,
    })

    expect(second.maturity).toEqual(first.maturity)
    expect(second.experience).toEqual(first.experience)
    expect(second.loadingMessage.id).not.toBe(first.loadingMessage.id)
    expect(second.caseNumber).not.toBe(first.caseNumber)
  })
})

describe('latest-only consultation scheduling', () => {
  it('does not complete before the consultation delay and then reveals the record', () => {
    vi.useFakeTimers()
    const completed: string[] = []
    const scheduler = createConsultationScheduler<string>()
    scheduler.schedule('official', (value) => completed.push(value))

    vi.advanceTimersByTime(CONSULTATION_DELAY_MS - 1)
    expect(completed).toEqual([])
    vi.advanceTimersByTime(1)
    expect(completed).toEqual(['official'])
  })

  it('allows only the latest rapid submission to complete', () => {
    vi.useFakeTimers()
    const completed: string[] = []
    const scheduler = createConsultationScheduler<string>()
    scheduler.schedule('stale', (value) => completed.push(value))
    scheduler.schedule('latest', (value) => completed.push(value))
    vi.runAllTimers()
    expect(completed).toEqual(['latest'])
  })

  it('cancels pending work for unmount cleanup without invoking callbacks', () => {
    vi.useFakeTimers()
    const completed = vi.fn()
    const scheduler = createConsultationScheduler<string>()
    scheduler.schedule('pending', completed)
    scheduler.cancel()
    vi.runAllTimers()
    expect(completed).not.toHaveBeenCalled()
  })

  it('can be safely cancelled more than once', () => {
    vi.useFakeTimers()
    const scheduler = createConsultationScheduler<string>()
    expect(() => {
      scheduler.cancel()
      scheduler.cancel()
    }).not.toThrow()
  })
})
