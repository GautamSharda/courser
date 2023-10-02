module Lecture2Full where

import Data.Char

{-------------------------------------------------------------------------------

Today's motivating example is a Caesar, or shift cypher.  But we're going to get
there in several stages.

The first point we need to make is that a Haskell file is a series of
definitions.  A definition contains:

* A type signature
* A series of equations

where each equation has *at least*:

* A left-hand side---the thing we're defining.
* A right-hand side---the body of the definition.

We'll see more of the structure of definitions as we go along...

-------------------------------------------------------------------------------}

message :: String
message = "Attack at dawn"

shiftAmount :: Int
shiftAmount = 3

{-------------------------------------------------------------------------------

The right-hand side need not be a single expression---there could be computation
there.

-------------------------------------------------------------------------------}

biggerShiftAmount :: Int
biggerShiftAmount = shiftAmount + 1

{-------------------------------------------------------------------------------

(+) is actually just a Haskell function like any other... but unlike most
Haskell functions, it's (*by default*) written infix.  Most Haskell functions
are *by default* written prefix:

-------------------------------------------------------------------------------}

shiftedLetter :: Char
shiftedLetter = chr (ord 'a' + biggerShiftAmount)

{-------------------------------------------------------------------------------

We can evaluate Haskell expressions either using the Haskell interpreter `ghci`,
or by using doctest-style comments in our source code.  I'll mostly rely on the
latter for now.

-------------------------------------------------------------------------------}

-- >>> biggerShiftAmount
-- 4

-- >>> shiftedLetter
-- 'e'

{-------------------------------------------------------------------------------

We define our own functions using equations, the same way we define constants.
The left-hand side of such an equation is a *pattern*---you can think of it as
an example of the uses of the thing we're defining:

-------------------------------------------------------------------------------}

shiftConstant :: Char -> Char
shiftConstant c = chr (ord c + shiftAmount)

-- >>> shiftConstant 'a'
-- 'd'

-- >>> shiftConstant 'C'
-- 'F'

{-------------------------------------------------------------------------------

Multiple argument functions are written just the same as single argument
functions---separate arguments with spaces.

(In fact, there's really no such thing as a multiple argument function in
Haskell, but we'll talk about that later...)

-------------------------------------------------------------------------------}

shift :: Int -> Char -> Char
shift n c = chr (ord c + n)

-- >>> shift shiftAmount 'a'

-- >>> shift biggerShiftAmount 'F'

{-------------------------------------------------------------------------------

A "higher-order" function is a function that operates on other
functions---either as an argument or as a result.

As far as Haskell is concerned, a higher-order function is just like any other
function---there's no special syntax to define or use one.

Higher-order functions are completely pervasive.

A prototypical example is the `map` function: `map f xs` applies `f` to every
element of list `xs`.  (Oh, that reminds me: Haskell strings are just lists of
characters...)

-------------------------------------------------------------------------------}

caesarConstant :: String -> String
caesarConstant s = map shiftConstant s

-- >>> caesarConstant "attack"
-- "dwwdfn"

-- >>> caesarConstant "zulu"
-- "}xox"

-- >>> caesarConstant message
-- "Dwwdfn#dw#gdzq"

{-------------------------------------------------------------------------------

There are clearly some problems here.  But let's put them on hold for a minute
and talk more about functions.

Multiple argument functions are actually higher-order functions... when we write

    shift :: Int -> Char -> Char

we're really defining a function that returns a function: `shift n` returns a
`Char -> Char` function.

This is why you can just write a bunch of arguments in row: `shift 3 'c'` is two
function applications: `(shift 3) 'c'`.

This means that we can also use `shift 3` anywhere we need a `Char -> Char`
function.

-------------------------------------------------------------------------------}

caesar0 :: Int -> String -> String
caesar0 n s = map (shift n) s

-- >>> caesar0 shiftAmount "attack"
-- "dwwdfn"

-- >>> caesar0 shiftAmount "zulu"
-- "}xox"

-- >>> caesar0 shiftAmount message
-- "Dwwdfn#dw#gdzq"

{-------------------------------------------------------------------------------

Let's make one more observation here: the argument `s` isn't doing anything.
We can remove it---this is formally called an η-reduction...

-------------------------------------------------------------------------------}

caesar0' :: Int -> String -> String
caesar0' n = map (shift n)

-- >>> caesar0' shiftAmount "attack"
-- "dwwdfn"

-- >>> caesar0' shiftAmount "zulu"
-- "}xox"

-- >>> caesar0' shiftAmount message
-- "Dwwdfn#dw#gdzq"

{-------------------------------------------------------------------------------

One problem we have here is that we're shifting non-letter characters---like
spaces.  Let's define a new version of the shift function that doesn't apply to
non-letters.  This gives us a good reason to introduce the next feature of
equations: guards.

-------------------------------------------------------------------------------}

shift' :: Int -> Char -> Char
shift' n c
  | isLetter c = shift n c
  | otherwise  = c

caesar1 :: Int -> String -> String
caesar1 n = map (shift' n)

{-------------------------------------------------------------------------------

We might want to think of the definition of the shifting function as part of the
definition of the caesar function.... so we could write it as a *local*
definition.

-------------------------------------------------------------------------------}

caesar1' :: Int -> String -> String
caesar1' n = map (shift' n)
  where shift' :: Int -> Char -> Char
        shift' n c
          | isLetter c = shift n c
          | otherwise  = c

{-------------------------------------------------------------------------------

Oh, we also have a wrap-around problem.

-------------------------------------------------------------------------------}

caesar2 :: Int -> String -> String
caesar2 n = map (shift n)
  where shift :: Int -> Char -> Char
        shift n c
          | not (isLetter c)  = c
          | toUpper c > wrap  = chr (ord c - 26 + n)
          | otherwise         = chr (ord c + n)
          where wrap :: Char
                wrap = chr (ord 'Z' - n)

-- >>> caesar2 shiftAmount message
-- "Dwwdfn dw gdzq"

{-------------------------------------------------------------------------------

Remember function composition from high-school algebra?

    (f ∘ g)(x) = f(g(x))

In Haskell, we spell that as `.`.  Here's a teaser:

-------------------------------------------------------------------------------}

caesar2' :: Int -> String -> String
caesar2' = map . shift
  where shift :: Int -> Char -> Char
        shift n c
          | not (isLetter c)  = c
          | toUpper c > wrap  = chr (ord c - 26 + n)
          | otherwise         = chr (ord c + n)
          where wrap :: Char
                wrap = chr (ord 'Z' - n)

-- >>> caesar2' shiftAmount message
-- "Dwwdfn dw gdzq"


-- Need a `main` function to make Cabal happy
main = return ()