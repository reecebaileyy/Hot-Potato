import Image from 'next/image'
import AppShell from '../components/AppShell'
import { ButtonLink, Card, SectionHeader } from '../components/ui'
import LiveRoundCard from '../components/landing/LiveRoundCard'
import PrizeSplit from '../components/landing/PrizeSplit'
import { GAME_ADDRESS, explorerAddressUrl, isGameConfigured } from '../config/chain'
import potatoBlink from '../../public/assets/images/potatoBlink.gif'

const DOCS_URL = 'https://0xhotpotato.gitbook.io/onchain-hot-potato/'
const CHAIN_DOCS_URL = 'https://docs.robinhood.com/chain/'

const STEPS = [
  {
    number: '01',
    title: 'Mint a hand',
    body: 'Hands cost 0.01 ETH, up to three per wallet per round. Each one is an ERC-721 that carries over to every future round.',
  },
  {
    number: '02',
    title: 'Pass the potato',
    body: 'A commit-reveal seed picks who starts with it. Pass it to any live hand before the fuse runs out; the fuse shortens every few passes.',
  },
  {
    number: '03',
    title: 'Last hand wins',
    body: 'When the fuse hits zero the holder explodes and is out. The last hand standing wins 40% of the pot.',
  },
] as const

export default function Home() {
  const contractUrl = isGameConfigured ? explorerAddressUrl(GAME_ADDRESS) : undefined

  const facts = [
    {
      title: 'Commit-reveal randomness',
      body: 'The round seed is committed before minting opens and revealed when play starts.',
    },
    {
      title: 'Pull payments',
      body: 'Prizes and shares wait in the contract until their owner claims them.',
    },
    {
      title: 'Transfer-locked during play',
      body: 'Hands cannot move while a round is live, so the board stays honest.',
    },
    {
      title: 'Verified on Blockscout',
      body: 'The Game contract source is published, so every rule can be read.',
      href: contractUrl,
    },
  ]

  return (
    <AppShell
      title="Hot Potato: Hold. Pass. Survive."
      description="The onchain Hot Potato game on Robinhood Chain. Mint a hand, pass the potato before the fuse runs out, and take 40% of the pot if you're the last one standing."
      width="wide"
    >
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center animate-fade-up sm:py-24">
        <Image
          src={potatoBlink}
          alt=""
          width={68}
          height={80}
          priority
          unoptimized
          className="pixelated h-20 w-auto"
        />
        <SectionHeader
          size="xl"
          align="center"
          eyebrow="Onchain on Robinhood Chain"
          title="Hold. Pass. Survive."
          description="Mint a hand, pass the potato before the fuse runs out, and take 40% of the pot if you're the last one standing."
          className="mt-6"
        />
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/play" size="lg" className="w-full sm:w-auto">
            Play now
          </ButtonLink>
          <ButtonLink href="#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
            How it works
          </ButtonLink>
        </div>
      </section>

      {/* Live round */}
      <section className="py-16 sm:py-24">
        <LiveRoundCard />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-24">
        <SectionHeader
          size="lg"
          align="center"
          title="Three moves. One survivor."
          description="Every mint, pass and explosion is a transaction on Robinhood Chain."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.number} as="article">
              <p className="text-[12px] font-medium uppercase tracking-wide text-fg-secondary tnum">{step.number}</p>
              <h3 className="mt-3 text-[17px] font-semibold leading-6">{step.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-fg-secondary">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Prize split */}
      <section className="py-16 sm:py-24">
        <SectionHeader
          size="lg"
          align="center"
          title="Every round pays out onchain."
          description="The pot is split the moment a round ends. No custodian, no waiting on a team."
        />
        <PrizeSplit className="mt-10" />
      </section>

      {/* Built on Robinhood Chain */}
      <section className="py-16 sm:py-24">
        <div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
          <div>
            <SectionHeader
              size="lg"
              title="Built on Robinhood Chain"
              description="An Arbitrum-style L2 with ETH gas and sub-second blocks. Every mint, pass and explosion is a transaction you can verify."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href={CHAIN_DOCS_URL} variant="ghost" external>
                Robinhood Chain docs
              </ButtonLink>
              <ButtonLink href={DOCS_URL} variant="ghost" external>
                Game docs
              </ButtonLink>
            </div>
          </div>
          <Card variant="inset" className="p-0">
            <ul>
              {facts.map((fact) => (
                <li key={fact.title} className="border-t border-line px-4 py-4 first:border-t-0 sm:px-5">
                  {fact.href ? (
                    <a
                      href={fact.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[15px] font-semibold leading-6 text-fg transition-colors duration-200 ease-apple hover:text-accent"
                    >
                      {fact.title}
                    </a>
                  ) : (
                    <p className="text-[15px] font-semibold leading-6">{fact.title}</p>
                  )}
                  <p className="mt-0.5 text-[13px] leading-5 text-fg-secondary">{fact.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <SectionHeader size="lg" align="center" title="Ready when you are." />
        <ButtonLink href="/play" size="lg" className="mt-8">
          Play now
        </ButtonLink>
      </section>
    </AppShell>
  )
}
