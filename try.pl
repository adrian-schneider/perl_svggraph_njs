#!/usr/bin/perl
use strict;
use warnings;
use diagnostics;
use lib "./";
use SvgGraphNjs qw(:Basic :Shapes :Axis);

$SvgGraphNjs::testmode = 1;
$SvgGraphNjs::forceinit = 1;
#$SvgGraphNjs::redrawinterval = 2000;

newPage;

my $testnumber = 2;

if ($testnumber == 0) {
  plotPoint;
  for (my $i = 0; $i < 1000; $i++) {
    plot(200 + rand(200), 300 + rand(200));
  }

  setLineStyle(2);
  ellipticArc(300, 300, 200, 200, 0.0, 0.8, 30, 1);
  setLineStyle(0);
  ellipticArc(350, 300, 200, 200, 0.0, 0.8, 30, 1);
}

if ($testnumber == 1) {
  setChrSize(SvgGraphNjs::TINY);
  axis(200, 350, 500, 0, -3.14, 3.14, 3.14/8.0, "%.2f", 4);
  axis(200, 100, 500, 2, -1.0, 1.0, 0.1, "%.1f", 5);

  mapDef(-3.14, -1.0, 3.14, 1.0, 200, 100, 699, 599);

  setColor(SvgGraphNjs::GREEN);
  plotLine();
  for (my $phi = -SvgGraphNjs::PI(); $phi <= SvgGraphNjs::PI()+0.01; $phi += SvgGraphNjs::PI()/20.0) {
    my $y = sin($phi);
    plot(mapX($phi), mapY($y));
  }
  setLineStyle(2);
  setColor(SvgGraphNjs::BLUE);
  plotLine();
  for (my $phi = -SvgGraphNjs::PI(); $phi <= SvgGraphNjs::PI()+0.01; $phi += SvgGraphNjs::PI()/20.0) {
    my $y = cos($phi);
    #plot(mapX($phi), mapY($y));
    plot(mapX(mapwX(mapX($phi))), mapY(mapwY(mapY($y))));
  }
  setLineStyle(0);
  setChrSize(SvgGraphNjs::MEDIUM);
  home(0, 0);
  setColor(SvgGraphNjs::HALFBRIGHT);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  setColor(SvgGraphNjs::NORMALBRIGHT);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  setColor(SvgGraphNjs::DOUBLEBRIGHT);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
  text("Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit",  SvgGraphNjs::NEWLINE);
}

if ($testnumber == 2) {
  sleep 2;

  setLineStyle(2);
  ellipticArc(300, 300, 200, 200, 0.0, 0.8, 30, 1);
  showPage;
  sleep 2;

  setLineStyle(0);
  ellipticArc(350, 300, 200, 200, 0.0, 0.8, 30, 1);
  showPage;
  sleep 2;

  if (1) {
    for (my $j = 0; $j < 5; $j++) {
      plotPoint;
      for (my $i = 0; $i < 200; $i++) {
        plot(200 + rand(200), 300 + rand(200));
      }

      showPage;
      sleep 1;
    }
  }
}

endPage;
#copyPage;
