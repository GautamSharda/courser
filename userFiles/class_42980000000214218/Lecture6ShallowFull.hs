module Lecture6ShallowFull where

import Prelude hiding ((<>), (<|>), words)
import Data.List ((\\))

{-------------------------------------------------------------------------------

The idea here is a shallow embedding of regular expressions in Haskell.

For the start, we're not going to worry about named groups or anything---we're
just trying to return a Boolean answer of whether or not a string matches a
regex.

-------------------------------------------------------------------------------}

{-------------------------------------------------------------------------------

So then, what does a regular expression *mean*?  If this were the automata
theory class, we'd say a regular expression defines a set of strings (or
equivalently, a function from strings to Booleans).  Let's see how that plays
out in Haskell.

-------------------------------------------------------------------------------}

type Regex = [String]

alphabet :: [Char]
alphabet = ['a'..'z'] ++ ['A'..'Z'] ++ ['0'..'9'] ++ [' ', '\r', '\t', '\n']


{-------------------------------------------------------------------------------

Character classes are easy: we just need to turn each character in the class
into the corresponding string.

-------------------------------------------------------------------------------}

chars :: [Char] -> Regex
chars = map singleton
    where singleton :: a -> [a]
          singleton c = [c]

notChars :: [Char] -> Regex
notChars = chars . (alphabet \\)

anyChar :: Regex
anyChar = chars alphabet

---------------------------------------------------------------------------------
-- Alternation (r|s) accepts strings accepted by either r or s, so we can just
-- union the sets accepted by both.  (Again, the set/list distinction ought to
-- be at least observed in passing...)

(<|>) :: Regex -> Regex -> Regex
p <|> r = p ++ r

none :: Regex
none = []

--------------------------------------------------------------------------------
-- Finally, the interesting case: what to do about concatenation?  The regular
-- expression (pr) succeeds if p accepts some portion of the string, and then r
-- accepts the remainder of the string.  To capture this, we want to follow
-- every string in the meaning of p with some string in the meaning of r.  Let's
-- abstract that a little bit:

crossWith :: (a -> b -> c) -> [a] -> [b] -> [c]
crossWith f xs ys = concatMap (every xs) ys
    where every xs y = map (\x -> f x y) xs

(<>) :: Regex -> Regex -> Regex
(<>) = crossWith (++)

empty :: Regex
empty = [""]

--------------------------------------------------------------------------------
-- We can now define the remaining operators in terms of each other:
--   r?  ==  empty | r
--   r+  ==  r(r*)
--   r*  ==  (r+)?

question :: Regex -> Regex
question = (empty <|>)

plus :: Regex -> Regex
plus m = m <> star m

star :: Regex -> Regex
star = question . plus

--------------------------------------------------------------------------------
-- Now, let's define some tests

upper, lower, space :: Regex
upper = chars ['A'..'Z']
lower = chars ['a'..'z']
space = chars [' ', '\t', '\r', '\n']

-- >>> upper
-- ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]

-- >>> lower
-- ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]

capWord, capWords :: Regex
capWord = upper <> star lower
capWords = plus (capWord <> plus space)

-- >>> take 20 capWord


word, words :: Regex
word = capWord <|> plus lower
words = plus (word <> plus space)
