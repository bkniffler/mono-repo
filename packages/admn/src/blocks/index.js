import Soundcloud from './soundcloud';
import Image from './image';
import Images from './images';
import Youtube from './youtube';
import Gmap from './gmap';
import Unstyled from './unstyled';
import Header from './header';

var blocks = {
   Youtube,
   Soundcloud,
   Image,
   Images,
   Gmap,
   'header-1': Header(1),
   'header-2': Header(2),
   'header-3': Header(3),
   'header-4': Header(4),
   'header-5': Header(5),
   unstyled: Unstyled
};

export default blocks;
